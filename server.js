const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
Promise.config({
  cancellation: true
});
const express = require('express');
const bodyParser = require('body-parser');
const Utils = require('./utils');
const Messages = require('./bot_messages/messages');
const DataPull = require('./data-pull');
const covidCases = require('./covid-cases');
const groupAdmin = require('./grp-chat');
const regex = require('./regex');
const Types = require('./type_constants');
const spamApi = require('./spam_detect/spam_api');

const uncleLeeBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
uncleLeeBot.setWebHook(process.env.WEBHOOK_URL + "/" + process.env.WEBHOOK_TOKEN);

const app = express();

app.use(bodyParser.json());

app.post("/" + process.env.WEBHOOK_TOKEN, (req, res) => {
  uncleLeeBot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log("Express server listening at port: " + process.env.PORT);
});

// Listening for the CRON JOB request to update the COVID-19 cases for Australia
app.get("/covid-19/au/fetch", (req, res) => {
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
});

// Listening for the CRON JOB request to update the COVID-19 cases for Singapore
app.get("/covid-19/sg/fetch", (req, res) => {
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
});

// Listening for the CRON JOB request to push updates to the group chats
app.get("/grpchat/updates/au-nz", (req, res) => {
  // Retrieve an object, where each key-value pair is a grpChatId mapped to a grpChatMsg
  groupAdmin.getBroadcastInfo(Types.REGION_AU_NZ).then((chatIdToMsgObj) => {
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
});

// Listening for the CRON JOB request to announce COVID-19 cases for Australia (Non-SGN group chats)
app.get("/covid-19/au/announce", (req, res) => {
  // Retrieve the latest COVID-19 cases for AU
  covidCases.getCovidCasesAU().then((caseInfo) => {
    // Then we retrieve the group chats who are in the AU / NZ region
    groupAdmin.getChatIdsFromNonSgnRegion(Types.REGION_AU_NZ).then((chatIdList) => {
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
});

// Listening for the CRON JOB request to announce COVID-19 cases for Singapore (Non-SGN group chats)
app.get("/covid-19/sg/announce", (req, res) => {
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
});

// On START
uncleLeeBot.onText(regex.cmdStart, (msg) => {
  // If this is a 1-on-1 chat
  if (msg.chat.id === msg.from.id) {
    // We need to ask the user which region's message they would like to see
    uncleLeeBot.sendMessage(
      msg.chat.id,
      "Which region's help message would you like to see?",
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateHelpMsgReg(), 2)
      }
    );
  }
});

// The HELP command
uncleLeeBot.onText(regex.cmdHelp, (msg) => {
  // Check if this is a group chat, or a 1-to-1 chat
  // If this is a 1-to-1 chat, we need to ask the user which region's help message they're looking for
  if (msg.chat.id === msg.from.id) {
    // Send out a inline keyboard button to let them choose
    uncleLeeBot.sendMessage(
      msg.chat.id,
      "Which region's help message would you like to see?",
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateHelpMsgReg(), 2)
      }
    );
  }
  // Else if this is a group chat, we check which region this group chat belongs to
  else {
    groupAdmin.getRegionFromChatId(msg.chat.id)
      .then((grpChatRegion) => {
        // With the group chat region, we reply with the appropriate help message
        let helpMsg = "";
        if (grpChatRegion == Types.REGION_SG) {
          helpMsg = Messages.SG_MSGS.HELP_MSG;
        }
        else if (grpChatRegion == Types.REGION_AU_NZ) {
          helpMsg = Messages.AU_MSGS.HELP_MSG;
        }
        uncleLeeBot.sendMessage(
          msg.chat.id,
          helpMsg
        )
      })
      .catch((err) => {
        // If there's an error, inform me of it
        uncleLeeBot.sendMessage(
          Number(process.env.DOHPAHMINE),
          "Ah boy ah, there was an issue with retrieving the group chat region with this group chat ID:\n\n" + err
        );
      })
  }
});

// The INFO command
uncleLeeBot.onText(regex.cmdInfo, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.UTIL_MSGS.INFO_MSG + Messages.UTIL_MSGS.PVT_MSG_OPT,
    {
      'reply_to_message_id': msg.message_id
    },
  );
});

// The GOING HOME command
uncleLeeBot.onText(regex.cmdGoingHome, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.AU_MSGS.GOING_HOME_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The FLIGHT STATUSES command
uncleLeeBot.onText(regex.cmdFltStatus, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.AU_MSGS.FLT_STATUS_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The CHATS command
uncleLeeBot.onText(regex.cmdChats, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.UTIL_MSGS.CHAT_GRPS_MSG + Messages.UTIL_MSGS.PVT_MSG_OPT,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The GET (COVID) CASES command
uncleLeeBot.onText(regex.cmdGetCases, (msg) => {
  // If this is coming from an individual's get request
  if (msg.chat.id === msg.from.id) {
    // Check with them which region's cases they would like to see
    uncleLeeBot.sendMessage(
      msg.chat.id,
      "Which region's COVID-19 cases would you like to see?",
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateCovidCaseReg(), 2)
      }
    )
  }
  else {
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
          // If this is the AU / NZ region, show cases in that region
          case Types.REGION_AU_NZ:
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
              // .then(() => {
              //   if (msg.chat.id !== msg.from.id) {
              //     uncleLeeBot.sendMessage(
              //       msg.chat.id,
              //       "Hey " + msg.from.first_name +
              //       ", I've just sent you the details in our private chat!"
              //     )
              //   }
              // })
              // .catch((error) => {
              //   uncleLeeBot.sendMessage(
              //     msg.chat.id,
              //     "Hey " + msg.from.first_name + 
              //     ", I can only provide the details if you tap here: @sgn_help_bot and type 'getcases' to me directly.",
              //     {
              //       'reply_to_message_id': msg.message_id,
              //     }
              //   )
              // });
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
});

// The BUDGET command
uncleLeeBot.onText(regex.cmdBudget, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.SG_MSGS.BUDGET_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The SHN command
uncleLeeBot.onText(regex.cmdShn, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.SG_MSGS.SHN_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The CBREAK command
uncleLeeBot.onText(regex.cmdCBreak, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.SG_MSGS.CB_RULES_QN_HEADER_MSG,
    {
      'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateCBreakerMsgOpts(), 1),
    },
  );
});

// The GROCERIES command
uncleLeeBot.onText(regex.cmdGroceries, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.SG_MSGS.GROCERIES_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The listener for official SGN channel announcements
uncleLeeBot.on('channel_post', (msg) => {
  let chatType = msg.chat.type;
  let chatTitle = msg.chat.title;

  // If this message came from the official SGN channel
  if ((chatType === Types.TELEGRAM_GRP_CHAT_CHN) && (chatTitle === Types.OFFICIAL_SGN_CHN_TITLE)) {
    // We broadcast this to every SGN channel
    groupAdmin.getAllSgnChats().then((grpChatIds) => {
      if (grpChatIds !== null) {
        for (let idx in grpChatIds) {
          uncleLeeBot.sendMessage(
            Number(grpChatIds[idx]),
            Messages.UTIL_MSGS.SGN_CHN_ANNOUNCE_MSG
          );
        }
      }
      else {
        throw "The SGN channel retrieval from the datastore rendered no search results. The array is null."
      }
    })
    // Send me a message if there was an error
    .catch((err) => {
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Ah boy ah, there was a problem with retrieving the SGN group chats:\n\n" + err,
      );
    });
  }
});

// The listener for messages from users
uncleLeeBot.on('message', (msg) => {
  // We do a spam analysis on the message, if the text isn't empty
  if (typeof msg.text !== 'undefined') {
    spamApi.detectMessage(msg.text).then((isSpam) => {
      if (isSpam) {
        // We kick the user out first upon spam detection
        uncleLeeBot.kickChatMember(msg.chat.id, msg.from.id).then((isSuccess) => {
          // If there is an issue with kicking the user, notify me
          if (isSuccess) {
            uncleLeeBot.sendMessage(
              Number(process.env.SGN_BAN_LIST_CHAT),
              "Ah boy, I've made a kick from a group chat, here's the details:\n\n" +
              "Group chat title: " + msg.chat.title + "\n" +
              "Kicked user: " + msg.from.first_name + " " + msg.from.last_name + "\n" +
              " (" + msg.from.username + ")" + "\n" +
              "For spamming: " + msg.text
            );
          }
        })
        // Then we clean up the message from the group chat
        .then(() => {
          uncleLeeBot.deleteMessage(msg.chat.id, msg.message_id);
        })
        // If there's an issue with kicking the user, notify me
        .catch((err) => {
          uncleLeeBot.sendMessage(
            Number(process.env.SGN_BAN_LIST_CHAT),
            "Ah boy ah, there was a problem trying to kick the spammer out. Here's the details:\n\n" +
            "Group chat title: " + msg.chat.title + "\n" +
            "User attempted to kick: " + msg.from.first_name + " " + msg.from.last_name + 
            " (" + msg.from.username + ")" + "\n" +
            "Reason: " + err
          );
        });
      }
    })
    .catch((err) => {
      uncleLeeBot.sendMessage(
        process.env.DOHPAHMINE,
        "Ah boy ah, we got a problem with the spam detection API:\n\n" + err + "\n\nThe message sent was:\n\n" + msg.text
      );
    });
  }

  // If we have a forwarded message from myself, then start getting details about the original sender
  if (typeof msg.forward_from !== 'undefined') {
        // Check if I am in the chat ID with myself and Uncle Lee, and this message came from me (and not Uncle Lee)
    if ((msg.chat.id === msg.from.id) && (msg.from.id === Number(process.env.DOHPAHMINE))) {
      // Get the details of the forwarded message
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Ah boy ah,\n\n" +
        "Message from original sender: " + msg.text + "\n" +
        "Name of original sender: " + msg.forward_from.first_name + " " + msg.forward_from.last_name + "\n" +
        "Username of original sender: " + msg.forward_from.username + "\n" +
        "[ USER ] ID of original sender: " + msg.forward_from.id + "\n" +
        "Details of forwarder:\n\n" +
        "Name of forwarder: " + msg.from.first_name + " " + msg.from.last_name + "\n" +
        "Username of forwarder: " + msg.from.username + "\n" +
        "User ID of forwarder: " + msg.from.id
      )
    }
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                                ADMIN-RELATED COMMANDS FROM HERE
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// To add a group chat to the datastore
uncleLeeBot.onText(regex.adminCmdRegGrpChat, (msg) => {
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
});

// This is when a callback query is received, from the pressing of the chat region buttons
uncleLeeBot.on('callback_query', (cbq) => {
  // Split the data received into a callback type, and the actual callback value
  let cbqType = Utils.getCallbackType(cbq.data);
  let cbqValue = Utils.getCallbackValue(cbq.data);

  if (cbqType === Types.UPDATE_GROUP_MESSAGE) {
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
  }
  else if (cbqType === Types.REGISTER_GROUP_CHAT) {
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
        
      }));
    })
    .catch((err) => {
      uncleLeeBot.answerCallbackQuery(cbq.id);
    });
  }
  else if (cbqType === Types.USER_SELECT_COVID_REGION) {
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
      
      // If Australia / New Zealand was selected
      case Types.REGION_AU_NZ:
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
          
        }));
        break;
    }
  }
  else if (cbqType === Types.REGISTER_GROUP_CHAT_IS_SGN) {
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
        
      }));
    });
  }
  else if (cbqType === Types.USER_SELECT_HELP_MSG_REGION) {
    // Answer the callback query! (MANDATORY)
    uncleLeeBot.answerCallbackQuery(cbq.id);
    let helpMsg = "";
    switch (cbqValue) {
      // If Singapore was selected
      case Types.REGION_SG:
        // Return the help message for Singapore
        helpMsg = Messages.SG_MSGS.HELP_MSG;
        break;
      case Types.REGION_AU_NZ:
        // Return the help message for Australia / New Zealand
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
  }
  else if (cbqType === Types.USER_SELECT_CBREAKER_FAQ_OPT) {
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
  }
});

// The BAN USER command (From all SGN group chats that the bot administrates)
uncleLeeBot.onText(regex.adminBanHammer, (msg) => {
  if (msg.from.id === Number(process.env.DOHPAHMINE)) {
    let splitMsg = msg.text.split(' ', 2);
    // We retrieve the user ID that we want to ban
    let userToBan = Number(splitMsg[1]);

    // If the user ID is valid
    if (isNaN(userToBan) === false) {
      // We gather all SGN group chats that the bot is a part of
      groupAdmin.getAllSgnChats().then((grpChatIds) => {
        for (idx in grpChatIds) {
          // We kick the user out of the group
          uncleLeeBot.kickChatMember(grpChatIds[idx], userToBan).then((isSuccess) => {
            return isSuccess;
          })
          .then((isSuccess) => {
            // We retrieve the group chat name with the group chat ID
            groupAdmin.getGrpChatNameWithId(Number(grpChatIds[idx])).then((grpChatName) => {
              // If we get a null, this means there's no result
              if (grpChatName === null) {
                // Notify the admin
                uncleLeeBot.sendMessage(
                  Number(process.env.DOHPAHMINE),
                  "Something has gone wrong, there is no group chat with this ID: " + grpChatIds[idx]
                );
              }
              else {
                if (isSuccess) {
                  uncleLeeBot.sendMessage(
                    Number(process.env.DOHPAHMINE),
                    "The user has been removed from group: " + grpChatName
                  );
                }
                else {
                  uncleLeeBot.sendMessage(
                    Number(process.env.DOHPAHMINE),
                    "Could not kick this user out of the group: " + grpChatName
                  );
                }
                return;
              }
            });
          })
          .catch((err) => {
            uncleLeeBot.sendMessage(
              Number(process.env.DOHPAHMINE),
              "Ah boy ah, we have a problem kicking out the user from the group chat:\n\n" + err
            )
          })
        }
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
})

// The UPDATE GROUP MESSAGE command
uncleLeeBot.onText(regex.adminUpdateGrpMsg, (msg) => {
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
});

// The FORCE COVID UPDATE command
uncleLeeBot.onText(regex.adminForceCovidUpdate, (msg) => {
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
});

// The DIAGNOSTICS command
uncleLeeBot.onText(regex.adminRunDiagnostics, (msg, match) => {
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
});

// The ID ME command
uncleLeeBot.onText(regex.cmdIdMe, (msg) => {
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
});

// The NEHA SAYS command
uncleLeeBot.onText(regex.adminNehaSays, (msg) => {
  // if (msg.from.id === Number())
})