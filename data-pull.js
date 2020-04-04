module.exports = {
  getCovidUpdatesSG: () => {
    let cheerio = require('cheerio');
    let axios = require('axios').default;
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    return axios.get('https://www.moh.gov.sg/covid-19')
      .then((resp) => {
        // We get the HTML of the site
        let siteHtml = resp.data;
        let $ = cheerio.load(siteHtml);

        // Generate the object that will hold the data for COVID-19 cases in Singapore
        let caseObj = {'imported': {}, 'local': {}}
        let caseType;

        $('div[class=\'sfContentBlock\']').each((i, e) => {
          // For the imported cases
          if (i == 2) {
            caseType = 'imported'
            // We retrieve the title
            caseObj[caseType]['title'] = $(e).find('div h3 strong span').text().trim().replace(/\s+/g, ' ');

            let key = "";
            let spareKey = "";

            // Then we retrieve the case data for imported cases
            $(e).find('tr td').each((i, e) => {
              switch (i) {
                case 0:
                  key = $(e).text();
                  break;
                case 1:
                  caseObj[caseType][key] = $(e).text();
                case 2:
                  key = $(e).text();
                  break;
                case 3:
                  spareKey = $(e).text();
                  break;
                case 4:
                  caseObj[caseType][key] = $(e).text();
                  break
                case 5:
                  caseObj[caseType][spareKey] = $(e).text(); 
                  break;
                }
            })
          }
          // For the local cases, we just retrieve the title first
          if (i == 3) {
            caseType = 'local';
            caseObj[caseType]['title'] = $(e).find('div h3 strong span').text().trim().replace(/\s+/g, ' ');
            return false;   // We kill the function, we no longer need to iterate through the other sfContentBlocks
          }
        });

        // For the local cases information
        let label = "";
        $('div[class=\'sf_cols\']').each((i, e) => {
          // There are only 2 sf_cols we need, we don't need the rest, we can stop iterating after that
          if (i > 1) {
            return false;
          }

          // We retrieve the data we require
          $(e).find('tr td').each((i, e) => {
            if (i % 2 == 0) {
              label = $(e).text().trim().replace(/\s+/g, ' ')
              caseObj[caseType][label] = "";
            }
            else {
              caseObj[caseType][label] = $(e).text().trim().replace(/\s+/g, ' ');
            }
          })
        });
        /* Now we create the object that we will store in Firestore, as such:
        document -> {
          country: 'SG',
          dateTimeScraped: <datetime>
          cases: {
            'imported': {
              'title': ...,
              ...
            },
            'local': {
              'title': ...,
              ...
            }
          }
        }
        */
       let addToStore = {
        'country': 'SG',
        'dateTimeScraped': new Date(),  // We include a timestamp for when this was updated
        'cases': caseObj
      }

      // Now that we have our object, let's write it to Firestore
      let covidCasesRef = db.collection('covidCases')
      covidCasesRef.add(addToStore);

      return true;
    })
    .catch((err) => {
      console.log("There was an error retrieving the HTML for COVID-19 cases for Singapore:", err);
      return false;
    });
  },

  getCovidUpdatesAU: () => {
    let cheerio = require('cheerio');
    let axios = require('axios').default;
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    // Making a GET request to the Australian website to get the number of COVID cases
    return axios.get('https://www.health.gov.au/news/health-alerts/novel-coronavirus-2019-ncov-health-alert/coronavirus-covid-19-current-situation-and-case-numbers')
      .then((resp) => {
        // We get the HTML of the site
        let siteHtml = resp.data;
        let $ = cheerio.load(siteHtml);

        // Obtain the summary update for the table of figures
        let headerUpdate = $('p[class=\'au-callout\']').text().trim().replace(/\s+/g, ' ');

        // Then we parse the data we want, into usable figures
        let textFromTables = $('td').text();
        let cleanTextArr = textFromTables.split('\n').map((val) => {
          return val.trim().replace(/\s+/g, ' ');
        })
        .filter((trimmedVal) => {
          if (trimmedVal !== null || trimmedVal !== '') {
            return trimmedVal;
          }
        })
        .slice(0,-4);

        // Split the data into a key-value pair, where the key is the state in AU
        // and the value is the number of cases in that state
        let stateToCases = {};
        for (i = 0; i < cleanTextArr.length; i++) {
          // If this is the first item of the state-cases pair, then this is the state
          if (i % 2 == 0) {
            stateToCases[cleanTextArr[i]] = "";
          }
          else {
            // We the convert the number of cases into a number
            stateToCases[cleanTextArr[i-1]] = Number(cleanTextArr[i].match(/\d+/g).join(''));
          }
        };

        /* Now we create the object that we will store in Firestore, as such:
        document -> {
          country: 'AU',
          dateTimeScraped: <datetime>
          headerSummary: '...',
          cases: stateToCases
        }
        */
        
        let addToStore = {
          'country': 'AU',
          'dateTimeScraped': new Date(),  // We include a timestamp for when this was updated
          'headerSummary': headerUpdate,  // and the summary update provided by the AU government for the figures
          'cases': stateToCases
        }

        // Now that we have our object, let's write it to Firestore
        let covidCasesRef = db.collection('covidCases')
        covidCasesRef.add(addToStore);

        return true;
      })
      .catch((err) => {
        console.log("There was an error updating the COVID-19 cases for Australia:", err);
        return false;
      });
  }
}
