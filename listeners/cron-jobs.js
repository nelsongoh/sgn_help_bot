module.exports = {
  // For the cron job that fetches the COVID cases from the Australian government website
  onAUCovidCasesFetch: (uncleLeeBot, res) => {
    let DataPull = require('../data-pull');
    let Utils = require('../utils');
    DataPull.getCovidUpdatesAU().then((isUpdateSuccessful) => {
      if (isUpdateSuccessful) {
        res.sendStatus(200);
      }
      else {
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Hello ah boy!\n\n" +
  
          "The datetime now is: " + Utils.getDateTimeNowSydney() + "\n" +
          "There was an issue with the cron job to fetch the data from the Australian website."
        );
        res.sendStatus(500);
      }
    });
  },

  // For the cron job that fetches the COVID cases from the Singapore government website
  onSGCovidCasesFetch: (uncleLeeBot, res) => {
    let DataPull = require('../data-pull');
    let Utils = require('../utils');
    DataPull.getCovidUpdatesSG().then((isUpdateSuccessful) => {
      if (isUpdateSuccessful) {
        res.sendStatus(200);
      }
      else {
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Hello ah boy!\n\n" +
  
          "The datetime now is: " + Utils.getDateTimeNowSydney() + "\n" +
          "There was an issue with the cron job to fetch the data from the Singapore website."
        );
        res.sendStatus(500);
      }
    });
  },

  // For the cron job that announces messages to the AU group chats
  onAUAnnounce: (uncleLeeBot, res) => {
    let groupAdmin = require('../grp-chat');
    let Types = require('../type_constants');
    let Utils = require('../utils');
    // Retrieve an object, where each key-value pair is a grpChatId mapped to a grpChatMsg
    groupAdmin.getBroadcastInfo(Types.REGION_AU).then((chatIdToMsgObj) => {
      for (let chatId in chatIdToMsgObj) {
        uncleLeeBot.sendMessage(
          Number(chatId),
          chatIdToMsgObj[chatId]
        )
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          uncleLeeBot.sendMessage(
            Number(process.env.DOHPAHMINE),
            "Hello ah boy!\n\n" +
    
            "The datetime now is: " + Utils.getDateTimeNowSydney() + "\n" +
            "There was an issue sending a message to chat ID: " + chatId
          );
          res.sendStatus(500);
        })
      }
    })
    .catch((err) => {
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Uh oh ah boy, there was an issue with the cron job for broadcasting information to the AU / NZ channels: \n\n" + err 
      )
      res.sendStatus(500);
    })
  },

  // For the cron job that announces the COVID cases to the AU group chat
  onAUCovidAnnounce: (uncleLeeBot, res) => {
    let covidCases = require('../covid-cases');
    let Types = require('../type_constants');
    let groupAdmin = require('../grp-chat');
    // Retrieve the latest COVID-19 cases for AU
    covidCases.getCovidCasesAU().then((caseInfo) => {
      // Then we retrieve the group chats who are in the AU / NZ region
      groupAdmin.getChatIdsFromNonSgnRegion(Types.REGION_AU).then((chatIdList) => {
        if (chatIdList !== null) {
          // For each chat ID in the list
          for (let idx in chatIdList) {
            // We announce it to the chat
            uncleLeeBot.sendMessage(
              chatIdList[idx],
              caseInfo
            );
          }
          res.sendStatus(200);
        }
        else {
          res.sendStatus(500);
        }
      });
    })
    .catch((err) => {
      res.sendStatus(500);
    })
  },

  // For the cron job that announces the COVID cases to the SG group chat
  onSGCovidAnnounce: (uncleLeeBot, res) => {
    let covidCases = require('../covid-cases');
    let Types = require('../type_constants');
    let groupAdmin = require('../grp-chat');
    // Retrieve the latest COVID-19 cases for AU
    covidCases.getCovidCasesSG().then((caseInfo) => {
      // Then we retrieve the group chats who are in the SG region
      groupAdmin.getChatIdsFromNonSgnRegion(Types.REGION_SG).then((chatIdList) => {
        if (chatIdList !== null) {
          // For each chat ID in the list
          for (let idx in chatIdList) {
            // We announce it to the chat
            uncleLeeBot.sendMessage(
              chatIdList[idx],
              caseInfo
            );
          }
          res.sendStatus(200);
        }
        else {
          res.sendStatus(500);
        }
      });
    })
    .catch((err) => {
      res.sendStatus(500);
    })
  },
}