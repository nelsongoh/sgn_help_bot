module.exports = {
  getCovidCasesAU: () => {
    let Utils = require('./utils');
    const Firestore = require('@google-cloud/firestore');
    const db = new Firestore();

    let covidCasesAuRef = db.collection('covidCases');
    let query = covidCasesAuRef.where('country', '==', 'AU').orderBy('dateTimeScraped', 'desc').limit(1);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No matching documents found.");
          return;
        }

        let outputStr = "";

        snapshot.forEach((doc) => {
          // We parse the date and time of the event scraped into a suitable string format
          let dateTime = Utils.toDateTimeNowSydney(doc.data()['dateTimeScraped'].toDate());
          
          // We add the header summary from the Australian website to the string first
          outputStr += doc.data()['headerSummary'] + "\n\n";

          // Then we iterate through the cases object and output the cases
          for (let key in doc.data()['cases']) {
            if (doc.data()['cases'].hasOwnProperty(key)) {
              outputStr += (key + ": " + doc.data()['cases'][key] + "\n")
            }
          }

          outputStr += ("\n" + "Last retrieved on: " + dateTime + "\n" + "https://www.health.gov.au/news/health-alerts/novel-coronavirus-2019-ncov-health-alert/coronavirus-covid-19-current-situation-and-case-numbers");
        });

        return outputStr;
      })
      .catch((err) => {
        console.log("There was an error getting the documents:", err);
      });
  }
}