module.exports = {
  // This is a manager function to decide which callback query-related functions to call
  cbqManager: (uncleLeeBot, cbq) => {
    let Utils = require('../utils');
    let Types = require('../type_constants');
    // Split the data received into a callback type, and the actual callback value
    let cbqType = Utils.getCallbackType(cbq.data);
    let cbqValue = Utils.getCallbackValue(cbq.data);

    switch (cbqType) {
      case (Types.UPDATE_GROUP_MESSAGE):
        module.exports.onGrpMsgUpdate(uncleLeeBot, cbq, cbqValue);
        break;
      
      case (Types.REGISTER_GROUP_CHAT):
        module.exports.onGrpChatRegister(uncleLeeBot, cbq, cbqValue);
        break;

      case (Types.USER_SELECT_COVID_REGION):
        module.exports.onCovidRegionSelection(uncleLeeBot, cbq, cbqValue);
        break;

      case (Types.REGISTER_GROUP_CHAT_IS_SGN):
        module.exports.onMarkGrpChatAsSgn(uncleLeeBot, cbq, cbqType);
        break;

      case (Types.USER_SELECT_HELP_MSG_REGION):
        module.exports.onRegionHelpSelect(uncleLeeBot, cbq, cbqValue);
        break;

      case (Types.USER_SELECT_CBREAKER_FAQ_OPT):
        module.exports.onCBreakerQnSelect(uncleLeeBot, cbq, cbqValue);
        break;

      default:
        // If this doesn't match any known cbqType, we just answer the callback query
        uncleLeeBot.answerCallbackQuery(cbq.id);
        break;
    }
  },

  // This is the callback query function to handle group message updates
  onGrpMsgUpdate: (uncleLeeBot, cbq, cbqValue) => {
    let groupAdmin = require('../grp-chat');
    let Messages = require('../bot_messages/messages');
    // Here we get the callback query with its ID, and the callback data (groupChatId)
    // We update the database with the callback data, i.e. What group chat ID's message to change
    let userId = cbq.from.id;
    groupAdmin.updateGrpChatIdRef(userId, cbqValue).then((ifSuccess) => {
      let followUpMsg = "";

      // If we successfully update the chat ID that we need to
      if (ifSuccess) {
        followUpMsg = "Group chat selected!";
      }
      else {
        followUpMsg = "ERROR: Something went wrong!";
      }

      return followUpMsg;
    })
    .then((followUpMsg) => {
      // We answer the callback query (MANDATORY!)
      uncleLeeBot.answerCallbackQuery(
        cbq.id,
        {
          'text': followUpMsg,
        }  
      );
    })
    .then(() => {
      // We send another message to the user asking them for the group message
      // that they want to set now
      uncleLeeBot.sendMessage(
        userId,
        Messages.UTIL_MSGS.PROMPT_ADMIN_NEW_MSG,
        {
          'reply_markup': {
            'force_reply': true
          }
        }
      )
      // Then we attach a listener to listen for a reply from the user 
      .then((sentMsg) => {
        let listenerId = uncleLeeBot.onReplyToMessage(
          sentMsg.chat.id,
          sentMsg.message_id,
          // This is the callback function which triggers upon the user's reply
          (userReply) => {
            // We will need to update the message for the group chat in the DB, 
            groupAdmin.updateGrpChatMsg(userReply.from.id, userReply.text)
              .then((isSuccess) => {
                let outputMsg = "";
                if (isSuccess) {
                  outputMsg = "Done! The group chat message has been updated!"
                }
                else {
                  outputMsg = "Uh oh, something went wrong with the update!"
                }

                // Let the user know that the outcome of the message update
                uncleLeeBot.sendMessage(
                  userId,
                  outputMsg
                )
              })
              // Then we reset the group chat ID whose message needed to be changed
              // i.e. There is no group chat whose message needs changing now, already changed
              .then(() => {
                groupAdmin.updateGrpChatIdRef(userReply.from.id, -1)
                  .then((isSuccess) => {
                    // If there's an issue, notify me
                    if (!isSuccess) {
                      uncleLeeBot.sendMessage(
                        Number(process.env.DOHPAHMINE),
                        "There was an issue with resetting the group chat ID whose message needed to be changed."
                      )
                    }
                  })
              })
              // Then we need to detach the listener from Uncle Lee
              .then(() => {
                // Get the listener ID
                groupAdmin.getListenerId(userReply.from.id)
                  .then((botListenerId) => {
                    // If we have no issues
                    if (botListenerId !== false) {
                      // Detach the listener from Uncle Lee
                      uncleLeeBot.removeReplyListener(botListenerId);
                    }
                    else {
                      throw "Issue with retrieving the listener ID."
                    }
                  })
                  // Then if there are no issues, we continue with resetting the listener ID in the database
                  .then(() => {
                    // Reset the listener ID
                    groupAdmin.storeListenerId(userReply.from.id, -1)
                  })
                  .catch((err) => {
                    uncleLeeBot.sendMessage(
                      Number(process.env.DOHPAHMINE),
                      err
                    )
                  })
              })
              .catch((err) => {
                console.log(err);
              })
          }
        );

        // We need to store the listenerId so that the listener can be removed
        groupAdmin.storeListenerId(userId, listenerId)
          .then((isSuccess) => {
            if (!isSuccess) {
              uncleLeeBot.sendMessage(
                userId,
                "Uh oh, we had an issue storing the listener ID."
              )
            }
          });
      });
    })
    .catch((err) => {
      uncleLeeBot.answerCallbackQuery(cbq.id);
    })
  },

  // This is the callback query function to handle group chat registration
  onGrpChatRegister: (uncleLeeBot, cbq, cbqValue) => {
    let Utils = require('../utils');
    let groupAdmin = require('../grp-chat');
    let grpChatId = Utils.getCallbackGrpChatId(cbq.data);

    // Update the chat's region in the datastore
    groupAdmin.updateGrpChatRegion(grpChatId, cbqValue).then((isSuccess) => {
      let followUpMsg = "";
      if (isSuccess) {
        followUpMsg = "SUCCESS! Chat group registered!"
      }
      else {
        followUpMsg = "ERROR: There was a problem registering the group chat."
      }

      // We answer the callback query (MANDATORY!)
      uncleLeeBot.answerCallbackQuery(
        cbq.id,
        {
          'text': followUpMsg,
        }  
      );

      // Then we update the previously sent message (to ask them if this is a SGN-based chat)
      let grpChatIsSgnOpts = Utils.generateRegGrpChatIsSgn(grpChatId);
      uncleLeeBot.editMessageText(
        "Is this a SGN-based chat?",
        {
          'chat_id': cbq.message.chat.id,
          'message_id': cbq.message.message_id,
          'reply_markup': Utils.createInlineKeyboardMarkup(grpChatIsSgnOpts, 2)
        }
      )
      // It is possible that the message has already been edited, and an error is thrown
      // we just ignore the error and do nothing
      .catch((err => {
        ;
      }));
    })
    .catch((err) => {
      uncleLeeBot.answerCallbackQuery(cbq.id);
    });
  },

  // This is the callback query function to handle a user's selection of the region for COVID case statistics
  onCovidRegionSelection: (uncleLeeBot, cbq, cbqValue) => {
    let Types = require('../type_constants');
    let covidCases = require('../covid-cases');
    // Answer the callback query! (MANDATORY)
    uncleLeeBot.answerCallbackQuery(cbq.id);
    switch (cbqValue) {
      // If Singapore was selected
      case Types.REGION_SG:
        covidCases.getCovidCasesSG().then((casesSG) => {
          // Send the cases update to the user
          uncleLeeBot.editMessageText(
            casesSG,
            {
              'chat_id': cbq.message.chat.id,
              'message_id': cbq.message.message_id,
              'reply_markup': {
                'inline_keyboard': [[]]
              }
            }
          )
          // It is possible that the message has already been edited, and an error is thrown
          // we just ignore the error and do nothing
          .catch((err => {
            ;
          }));
        })
        .catch((err) => {
          // Else if there was an error, notify them that there was something wrong
          uncleLeeBot.editMessageText(
            "I'm sorry, but something went wrong with retrieving the information for the COVID-19 cases:\n\n" + err,
            {
              'chat_id': cbq.message.chat.id,
              'message_id': cbq.message.message_id,
              'reply_markup': {
                'inline_keyboard': [[]]
              }
            }
          )
          // It is possible that the message has already been edited, and an error is thrown
          // we just ignore the error and do nothing
          .catch((err => {
            
          }));
        })
        break;
      
      // If Australia was selected
      case Types.REGION_AU:
        covidCases.getCovidCasesAU().then((casesAU) => {
          // Send the cases update to the user
          uncleLeeBot.editMessageText(
            casesAU,
            {
              'chat_id': cbq.message.chat.id,
              'message_id': cbq.message.message_id,
              'reply_markup': {
                'inline_keyboard': [[]]
              }
            }
          )
          // It is possible that the message has already been edited, and an error is thrown
          // we just ignore the error and do nothing
          .catch((err => {
            
          }));
        })
        .catch((err) => {
          // Else if there was an error, notify them that there was something wrong
          uncleLeeBot.editMessageText(
            "I'm sorry, but something went wrong with retrieving the information for the COVID-19 cases:\n\n" + err,
            {
              'chat_id': cbq.message.chat.id,
              'message_id': cbq.message.message_id,
              'reply_markup': {
                'inline_keyboard': [[]]
              }
            }
          )
          // It is possible that the message has already been edited, and an error is thrown
          // we just ignore the error and do nothing
          .catch((err => {
            ;
          }));
        })
        break;

      default:
        uncleLeeBot.editMessageText(
          "There's something wrong with what the button is sending to the server. Please contact the bot administrator.",
          {
            'chat_id': cbq.message.chat.id,
            'message_id': cbq.message.message_id,
            'reply_markup': {
              'inline_keyboard': [[]]
            }
          }
        )
        // It is possible that the message has already been edited, and an error is thrown
        // we just ignore the error and do nothing
        .catch((err => {
          ;
        }));
        break;
    }
  },

  // This is the callback query function to handle a user's selection of whether a group chat belongs to SGN or not
  onMarkGrpChatAsSgn: (uncleLeeBot, cbq, cbqType) => {
    let Utils = require('../utils');
    let groupAdmin = require('../grp-chat');
    // Answer the callback query! (MANDATORY)
    uncleLeeBot.answerCallbackQuery(cbq.id);
    let gcid = Utils.getCallbackGrpChatId(cbq.data);
    let isSgn = false;
    
    if (cbqType === 'true') {
      isSgn = true;
    }

    // Update the chat's group chat SGN status in the datastore
    groupAdmin.updateGrpChatIsSgn(gcid, isSgn).then((isSuccess) => {
      let userOutputMsg = "";
      if (isSuccess) {
        userOutputMsg = "The group chat has been successfully registered in the datastore.";
      }
      else {
        userOutputMsg = "There was an error updating the SGN status of the group chat.";
      }
      uncleLeeBot.editMessageText(
        userOutputMsg,
        {
          'chat_id': cbq.message.chat.id,
          'message_id': cbq.message.message_id,
          'reply_markup': {
            'inline_keyboard': [[]]
          }
        }
      )
      // It is possible that the message has already been edited, and an error is thrown
      // we just ignore the error and do nothing
      .catch((err => {
        ;
      }));
    });
  },

  // This is the callback query function to handle the user's selection of which region's help message should be
  // displayed
  onRegionHelpSelect: (uncleLeeBot, cbq, cbqValue) => {
    let Types = require('../type_constants');
    let Messages = require('../bot_messages/messages');
    // Answer the callback query! (MANDATORY)
    uncleLeeBot.answerCallbackQuery(cbq.id);
    let helpMsg = "";
    switch (cbqValue) {
      // If Singapore was selected
      case Types.REGION_SG:
        // Return the help message for Singapore
        helpMsg = Messages.SG_MSGS.HELP_MSG;
        break;
      case Types.REGION_AU:
        // Return the help message for Australia
        helpMsg = Messages.AU_MSGS.HELP_MSG;
        break;
    }   
    uncleLeeBot.editMessageText(
      helpMsg,
      {
        'chat_id': cbq.message.chat.id,
        'message_id': cbq.message.message_id,
        'reply_markup': {
          'inline_keyboard': [[]]
        }
      }
    );
  },

  // This is the callback query function to handle the user's selection of the Circuit Breaker FAQ question
  onCBreakerQnSelect: (uncleLeeBot, cbq, cbqValue) => {
    let Messages = require('../bot_messages/messages');
    // Answer the callback query! (MANDATORY)
    uncleLeeBot.answerCallbackQuery(cbq.id);
    // We respond to the user's circuit breaker FAQ selection
    uncleLeeBot.editMessageText(
      Messages.SG_MSGS.CB_RULES_ANS_MSG[cbqValue],
      {
        'chat_id': cbq.message.chat.id,
        'message_id': cbq.message.message_id,
        'reply_markup': {
          'inline_keyboard': [[]]
        }
      }
    );
  },
}