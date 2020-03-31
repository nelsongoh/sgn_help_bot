module.exports = {
  getCovidCasesSG: () => {
    let Utils = require('./utils');
    let Types = require('./type_constants');
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let covidCasesAuRef = db.collection('covidCases');
    let query = covidCasesAuRef.where('country', '==', 'SG').orderBy('dateTimeScraped', 'desc').limit(1);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No matching documents found.");
          return;
        }

        let outputStr = "";

        snapshot.forEach((doc) => {
          // We parse the date and time of the event scraped into a suitable string format
          let dateTime = Utils.toDateTimeNowSingapore(doc.data()['dateTimeScraped'].toDate());
          
          // We add the header title from the Singapore website to the string first
          outputStr += doc.data()['headerSummary'] + "\n\n";

          // Then we iterate through the cases object and output the case numbers
          for (let key in doc.data()['cases']) {
            if (doc.data()['cases'].hasOwnProperty(key)) {
              outputStr += (key + ": " + doc.data()['cases'][key] + "\n")
            }
          }

          outputStr += ("\n" + "Last retrieved on: " + dateTime + "\n" + Types.COVID_19_SG_GOV);
        });

        return outputStr;
      })
      .catch((err) => {
        console.log("There was an error getting the documents:", err);
        throw err;
      });
  },

  getCovidCasesAU: () => {
    let Utils = require('./utils');
    let Types = require('./type_constants');
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

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

          outputStr += ("\n" + "Last retrieved on: " + dateTime + "\n" + Types.COVID_19_AU_GOV);
        });

        return outputStr;
      })
      .catch((err) => {
        console.log("There was an error getting the documents:", err);
        throw err;
      });
  }
}