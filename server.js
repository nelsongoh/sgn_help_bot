const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
Promise.config({
  cancellation: true
});

const express = require('express');
const bodyParser = require('body-parser');
const Utils = require('./utils');
const Messages = require('./messages');
const DataPull = require('./data-pull');
const covidCases = require('./covid-cases');
const groupAdmin = require('./grp-chat');
const regex = require('./regex');
const Types = require('./type_constants');

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
  if (msg.chat.id === msg.from.id) {
    uncleLeeBot.sendMessage(
      msg.from.id,
      Messages.HELP_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  }
});

// The HELP command
uncleLeeBot.onText(regex.cmdHelp, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.HELP_MSG + Messages.PVT_MSG_OPT,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The INFO command
uncleLeeBot.onText(regex.cmdInfo, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.INFO_MSG + Messages.PVT_MSG_OPT,
    {
      'reply_to_message_id': msg.message_id
    },
  );
});

// The GOING HOME command
uncleLeeBot.onText(regex.cmdGoingHome, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.GOING_HOME_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The FLIGHT STATUSES command
uncleLeeBot.onText(regex.cmdFltStatus, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.FLT_STATUS_MSG,
    {
      'reply_to_message_id': msg.message_id,
    },
  );
});

// The CHATS command
uncleLeeBot.onText(regex.cmdChats, (msg) => {
  uncleLeeBot.sendMessage(
    msg.chat.id,
    Messages.CHAT_GRPS_MSG + Messages.PVT_MSG_OPT,
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
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateCovidCaseReg())
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
            Messages.SGN_CHN_ANNOUNCE_MSG
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

// The listener for potential spam messages from user
uncleLeeBot.onText(regex.spamFilter, (msg) => {
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
      )
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
    )
  })
})

// The listener for forwarded messages from users
uncleLeeBot.on('message', (msg) => {
  // Check if I am in the chat ID with myself and Uncle Lee, and this message came from me (and not Uncle Lee)
  if ((msg.chat.id === msg.from.id) && (msg.from.id === Number(process.env.DOHPAHMINE))) {
    // If we have a forwarded message
    if (typeof msg.forward_from !== 'undefined') {
      // Get the details of the forwarded message
      uncleLeeBot.sendMessage(
        Number(process.env.DOHPAHMINE),
        "Ah boy ah,\n\n" +
        "Message from original sender: " + msg.text + "\n" +
        "User ID of original sender: " + msg.forward_from.id + "\n\n" +
        "Details of forwarder:\n\n" +
        "Name of forwarder: " + msg.from.first_name + " " + msg.from.last_name + "\n" +
        "Username of forwarder: " + msg.from.username + "\n" +
        "User ID of forwarder: " + msg.from.id
      )
    }
  }
})

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
            'reply_markup': Utils.createInlineKeyboardMarkup(keyboardData)
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
        Messages.PROMPT_ADMIN_NEW_MSG,
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
          'reply_markup': Utils.createInlineKeyboardMarkup(grpChatIsSgnOpts)
        }
      );
    })
    .catch((err) => {
      uncleLeeBot.answerCallbackQuery(cbq.id);
    });
  }
  else if (cbqType === Types.USER_SELECT_REGION) {
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
          );
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
          );
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
          );
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
          );
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
        );
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
      );
    });
  }
});

// The BAN USER command (From all group chats that the bot administrates)
uncleLeeBot.onText(regex.adminBanHammer, (msg) => {
  if (msg.from.id === Number(process.env.DOHPAHMINE)) {
    // We retrieve the user ID that we want to ban
    let userToBan = Number(msg.text.split(' ')[1]);
    
    // If the user ID is valid
    if (isNaN(userToBan) === false) {
      // We gather all group chats that the bot is a part of
      groupAdmin.getAllSgnChats().then((grpChatIds) => {
        for (idx in grpChatIds) {
          // We check to see if the user is in the group chat
          uncleLeeBot.kickChatMember(grpChatIds[idx], userToBan).then((isSuccess) => {
            if (isSuccess) {
              uncleLeeBot.sendMessage(
                Number(process.env.DOHPAHMINE),
                "The user has been removed from group: " + grpChatIds[idx]
              )
            }
            else {
              uncleLeeBot.sendMessage(
                Number(process.env.DOHPAHMINE),
                "Could not kick this user out of the group: " + grpChatIds[idx]
              )
            }
          }).catch((err) => {
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
        Messages.NOT_PERMITTED_MSG
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
          'reply_markup': Utils.createInlineKeyboardMarkup(keyboardCallback),
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