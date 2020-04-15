module.exports = {
  // For the command 'reggrpchat', to register a group chat to the datastore
  onRegisterGroup: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    let Utils = require('../utils');
    // Check to make sure if it's me
    if (msg.from.id === Number(process.env.DOHPAHMINE)) {
      // Create an entry in the datastore for the group chat, without the region first
      groupAdmin.regGrpChat(msg.chat.id, msg.chat.title).then((isSuccess) => {
        if (isSuccess) {
          // Generate the group chat regions for registering a group chat, with the group chat ID attached
          let keyboardData = Utils.generateRegGrpChatRegions(msg.chat.id);
        
          // Ask which region to add this chat to
          uncleLeeBot.sendMessage(
            Number(process.env.DOHPAHMINE),
            "Ah boy ah, which region do you want this group chat [ " + msg.chat.title + " ] classified as?",
            {
              'reply_markup': Utils.createInlineKeyboardMarkup(keyboardData, 2)
            }
          );
        }
      });
    }
  },

  // For the command 'updategrpmsg', to update a pre-recorded group message that is emitted to group chats
  // at specified frequencies via cron jobs
  onUpdateGrpMsg: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    let Utils = require('../utils');
    let Messages = require('../bot_messages/messages');
    // We need to retrieve the group chats that the user is allowed to change messages for
    groupAdmin.getAuthGrpChats(msg.from.id).then((permittedChats) => {
      // If we get an empty set back, then we know the user has no matching authorization
      if (permittedChats === null) {
        uncleLeeBot.sendMessage(
          msg.from.id,
          Messages.UTIL_MSGS.NOT_PERMITTED_MSG
        )
      }
      // Else if they do
      else {
        // Send them buttons to select which group chat they would like to update their message for
        
        // Edit the object to include a callback type for the listener to recognize
        let keyboardCallback = Utils.generateSelectGrpChatMsgUpdate(permittedChats);

        uncleLeeBot.sendMessage(
          msg.from.id,
          "Please select the group chat for which the message should be updated:",
          {
            'reply_markup': Utils.createInlineKeyboardMarkup(keyboardCallback, 2),
          }
        )
      }
    });
  },

  // For the 'forcecovidupdate' command, to force an update from the relevant COVID-19 websites, for all regions
  onForceCovidUpdate: (uncleLeeBot, msg) => {
    let DataPull = require('../data-pull');
    let Utils = require('../utils');
    if (msg.from.id === Number(process.env.DOHPAHMINE)) {
      // Trigger the pull to update the COVID cases into Firestore for Australia
      DataPull.getCovidUpdatesAU().then((isUpdateSuccessful) => {
        let covidUpdateSuccessMsg = "";
        if (isUpdateSuccessful) {
          covidUpdateSuccessMsg = "The COVID cases have been successfully updated for Australia.";
        }
        else {
          covidUpdateSuccessMsg = "There was an issue updating the COVID cases for Australia."
        }
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Hello ah boy!\n\n" +
  
          "The time now is: " + Utils.getDateTimeNowSydney() + "\n" +
          covidUpdateSuccessMsg
        );
      });
  
      // Trigger the pull to update the COVID cases into Firestore for Singapore
      DataPull.getCovidUpdatesSG().then((isUpdateSuccessful) => {
        let covidUpdateSuccessMsg = "";
        if (isUpdateSuccessful) {
          covidUpdateSuccessMsg = "The COVID cases have been successfully updated for Singapore.";
        }
        else {
          covidUpdateSuccessMsg = "There was an issue updating the COVID cases for Singapore."
        }
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Hello ah boy!\n\n" +
  
          "The time now is: " + Utils.getDateTimeNowSydney() + "\n" +
          covidUpdateSuccessMsg
        );
      });
    }
  },

  // The 'diagnostics' command, for pinging information regarding a group chat
  onGrpChatDiag: (uncleLeeBot, msg, match) => {
    let Utils = require('../utils');
    if (msg.from.id === Number(process.env.DOHPAHMINE)) {
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Hello ah boy!\n\n" +
  
        "The time now is: " + Utils.getDateTimeNowSydney() + "\n" +
        "The chat ID you pinged from is: " + msg.chat.id + "\n" +
        "The title of the chat is: " + msg.chat.title + "\n" +
        "You said: " + match[1],
      );
    }
  },

  // The 'idme' command, for pinging information about a user. Must be triggered by the user itself
  onIdMe: (uncleLeeBot, msg) => {
    uncleLeeBot.sendMessage(
      Number(process.env.DOHPAHMINE),
      "Hello ah boy! Someone has tried getting themselves ID-ed:\n\n" +
    
      "The chat ID they pinged from is: " + msg.chat.id + "\n" +
      "The title of the chat is: " + msg.chat.title + "\n" +
      "Their first name is: " + msg.from.first_name + "\n" +
      "Their last name is: " + msg.from.last_name + "\n" +
      "Their username is: " + msg.from.username + "\n" +
      "Their user ID is: " + msg.from.id,
    );
  },

  // The function to ban a user by their user ID
  banUserById: (uncleLeeBot, msg) => {
    // Ensure that this command came from me
    if (msg.from.id === Number(process.env.DOHPAHMINE)) {
      let splitMsg = msg.text.split(' ', 2);
      // We retrieve the information about the user that we want to ban
      let userToBan = Number(splitMsg[1]);
      let groupAdmin = require('../grp-chat');
      // If the user ID is valid
      if (isNaN(userToBan) === false) {
        // We gather all SGN group chats that the bot is a part of
        groupAdmin.getAllSgnChats().then((grpChatIds) => {
          let kickPromises = [];
          let kickUserSgnChats = (grpChatId, userToBan) => {
            // We kick the user out of the group
            uncleLeeBot.kickChatMember(grpChatId, userToBan)
              .then((isSuccess) => {
                return isSuccess;
              })
              .then((isSuccess) => {
                // We retrieve the group chat name with the group chat ID
                groupAdmin.getGrpChatNameWithId(Number(grpChatId))
                  .then((grpChatName) => {
                    // If we get a null, this means there's no result
                    if (grpChatName === null) {
                      // Notify the admin
                      uncleLeeBot.sendMessage(
                        Number(process.env.DOHPAHMINE),
                        "Something has gone wrong, there is no group chat with this ID:\n" + grpChatId
                      );
                    }
                    else {
                      if (isSuccess) {
                        uncleLeeBot.sendMessage(
                          Number(process.env.DOHPAHMINE),
                          "The user has been removed from group:\n" + grpChatName
                        );
                      }
                      else {
                        uncleLeeBot.sendMessage(
                          Number(process.env.DOHPAHMINE),
                          "Could not kick this user out of the group:\n" + grpChatName
                        );
                      }
                      return;
                    }
                  });
              })
              .catch((err) => {
                throw err;
              });
          }

          for (idx in grpChatIds) {  
            kickPromises.push(kickUserSgnChats(grpChatIds[idx], userToBan));
          };

          Promise.all(kickPromises)
            .catch((err) => {
              uncleLeeBot.sendMessage(
                Number(process.env.DOHPAHMINE),
                "Ah boy ah, we have a problem kicking out the user from the group chat:\n\n" + err
              )
            });
        })
        // Send an error message to me if there's an error
        .catch((err) => {
          uncleLeeBot.sendMessage(
            Number(process.env.DOHPAHMINE),
            "Ah boy ah, there was a problem trying to retrieve the SGN group chat IDs:\n\n" + err
          )
        })
      }
      // Else, send a message to inform me
      else {
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Unable to capture a valid user ID:\n\n" +
          "Received: " + msg.text + "\n" +
          "Parsed user ID is: " + msg.text.split(' ')[1]
        )
      }
    }
  }
}