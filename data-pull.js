module.exports = {
  getCovidUpdatesAu: () => {
    const cheerio = require('cheerio');
    const axios = require('axios').default;
    const Firestore = require('@google-cloud/firestore');
    const db = new Firestore();

    // Making a GET request to the Australian website to get the number of COVID cases
    return axios.get('https://www.health.gov.au/news/health-alerts/novel-coronavirus-2019-ncov-health-alert/coronavirus-covid-19-current-situation-and-case-numbers')
      .then((resp) => {
        // We get the HTML of the site
        const siteHtml = resp.data;
        const $ = cheerio.load(siteHtml);

        // Obtain the summary update for the table of figures
        const headerUpdate = $('p[class=\'au-callout\']').text().trim().replace(/\s+/g, ' ');

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
