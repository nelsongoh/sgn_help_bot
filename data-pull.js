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

        // Retrieve the 2 types of titles for the Singapore cases: Imported, and local
        let headerEle = [];
        $('div h3 strong span').each((i, ele) => {
            if (i > 2) {  // We don't need the rest after this
              return false;
            }
            headerEle[i] = $(ele).text().trim().replace(/\s+/g, ' ');
        });

        // Generate the object that will hold the data for COVID-19 cases in Singapore
        // We now split the object into 2 types of cases: Imported, and local
        let caseObj = {'imported': {}, 'local': {}}
        caseObj['imported']['title'] = headerEle[1];
        caseObj['local']['title'] = headerEle[2];

        // We need 2 temporary variables to store one part of the array where we
        // encounter 2 consecutive labels
        let key = "";
        let spareKey = "";

        // Obtain the labels and number of cases
        $('div[class=\'sfContentBlock\'] tr td').each((i, e) => {
          // 18 is a 'magic' number for the number of elements we stop at  
          if (i == 18) {
            return false;
          }
          let caseType;
          // The first 6 are a little problematic, needs some manual intervention
          // (For the imported cases data)
          if (i < 6) {
            caseType = 'imported';
            switch (i) {
              case 0:
                key = $(e).text();
                break;
              case 1:
                caseObj[caseType][key] = $(e).text();
                break;
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
          }
          // Otherwise the rest follow the alternate label and value pattern
          else {
            caseType = 'local';
            // where even-numbered indexes are labels
            if (i % 2 == 0) {
              title = $(e).text()
              caseObj[caseType][title] = "";
            }
            // and odd-numbered indexes are the number of cases
            // NOTE: We will store the number of cases as strings instead of integers, because
            // there are some figures which are represented as, e.g. 487 (+9)
            else {
              caseObj[caseType][title] = $(e).text();
            }
          }
        })
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
