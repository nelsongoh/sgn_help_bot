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

        // Obtain the summary title for the figures
        let headerTitle = "";
        
        $('div h3 strong span').each((i, ele) => {
          // 2 is a 'magic number' since that's the index of the site's header title that we want
          if (i == 2) {
            headerTitle = $(ele).text().trim().replace(/\s+/g, ' ');
          }
          // Stop iterating through once we have what we need
          else if (i > 2) {
            return false;
          }
        });

        // Generate the object that will hold the data for COVID-19 cases in Singapore
        let caseObj = {};

        let tempTitle;

        // Obtain the labels and number of cases
        $('td').each((i, ele) => {
          // 14 is a 'magic number' as well, since that's the number of figures available 
          // (index 0 to 13 is what we want, once we hit 14, we stop iterating)
          if (i == 14) {
            return false;
          }
          else {
            // Otherwise if we hit an even-numbered index, this is the label
            if (i % 2 == 0) {
              tempTitle = $(ele).text();
              caseObj[tempTitle] = "";
            }
            // Odd-numbered indexes are the number of cases
            // NOTE: We will store the number of cases as strings instead of integers, because
            // there are some figures which are represented as, e.g. 487 (+9)
            else {
              caseObj[tempTitle] = $(ele).text();
            }
          }
        });

        /* Now we create the object that we will store in Firestore, as such:
        document -> {
          country: 'SG',
          dateTimeScraped: <datetime>
          headerTitle: '...',
          cases: stateToCases
        }
        */
       let addToStore = {
        'country': 'SG',
        'dateTimeScraped': new Date(),  // We include a timestamp for when this was updated
        'headerSummary': headerTitle,  // and the summary title provided by the SG government for the figures
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
