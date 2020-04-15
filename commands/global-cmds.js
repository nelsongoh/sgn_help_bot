module.exports = {
  // For the 'getcases' command for 1-on-1 chats
  onGetCasesSolo: (uncleLeeBot, msg) => {
    let Utils = require('../utils');
    // Check with them which region's cases they would like to see
    uncleLeeBot.sendMessage(
      msg.chat.id,
      "Which region's COVID-19 cases would you like to see?",
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateCovidCaseReg(), 2)
      }
    )
  },

  // For the 'getcases' command in a group chat
  onGetCasesGrp: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    let Types = require('../type_constants');
    let covidCases = require('../covid-cases');
    // We need to check which region this chat is from
    groupAdmin.getRegionFromChatId(msg.chat.id).then((region) => {
      // If there is no result
      if (region === null) {
        // Inform the user that the group chat hasn't been registered yet
        uncleLeeBot.sendMessage(
          msg.chat.id,
          "Sorry, but your group chat hasn't been registered yet!"
        )
      }
      else {
        switch(region) {
          // If this is the AU region, show cases in that region
          case Types.REGION_AU:
            // We need to invoke the Promise-based method to get the values from Firestore
            covidCases.getCovidCasesAU().then((casesUpdate) => {
              // Once we have it, we send a reply to the user
              uncleLeeBot.sendMessage(
                msg.chat.id,
                casesUpdate,
                {
                  'reply_to_message_id': msg.message_id,
                }
              );
            });
            break;

          case Types.REGION_SG:
            covidCases.getCovidCasesSG().then((casesUpdate) => {
              // Once we have it, we send a reply to the user
              uncleLeeBot.sendMessage(
                msg.chat.id,
                casesUpdate,
                {
                  'reply_to_message_id': msg.message_id,
                }
              );
            });
            break;

          default:
            uncleLeeBot.sendMessage(
              msg.chat.id,
              "I'm sorry, but I don't have any information about COVID-19 cases in your region!",
              {
                'reply_to_message_id': msg.message_id,
              }
            );
            break;
        }
      }
    })
    .catch((err) => {
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Ah boy ah, looks like we have a problem with retrieving the group chat region with the group chat ID:\n\n" + err
      );
    })
  }
}