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
          
          // We iterate through the types of cases first (We expect 'imported' and 'local')
          for (let caseType in doc.data()['cases']) {
            if (doc.data()['cases'].hasOwnProperty(caseType)) {
              // We retrieve the title for this case type first
              outputStr += doc.data()['cases'][caseType]['title'] + "\n\n";
              // Then within the cases of that type, we iterate through the object
              for (let label in doc.data()['cases'][caseType]) {
                // If this is a title, we skip it since we've already added it into the string
                if (label === 'title') {
                  continue;
                }
                // Else these are the labels and case numbers
                else {
                  outputStr += (label + ": " + doc.data()['cases'][caseType][label] + "\n");
                }
              }
              // We have a line separator between imported and local cases
              outputStr += "------------------------------\n";
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

          // We sort the cases by in alphabetical order
          let sorted_obj = {}
          let unordered_obj = doc.data()['cases'];
          Object.keys(unordered_obj).sort().forEach((key) => {
            sorted_obj[key] = unordered_obj[key];
          });

          // Then we iterate through the cases object and output the cases
          for (let key in sorted_obj) {
            if (sorted_obj.hasOwnProperty(key)) {
              outputStr += (key + ": " + sorted_obj[key] + "\n")
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