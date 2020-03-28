const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const Utils = require('./utils');
const Messages = require('./messages');
const DataPull = require('./data-pull');
const covidCases = require('./covid-cases');
const groupAdmin = require('./grp-chat');
const regex = require('./regex');

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

// Listening for the cron job request to update the COVID cases for Australia
app.get("/covid-19/au/fetch", (req, res) => {
  DataPull.getCovidUpdatesAu().then((isUpdateSuccessful) => {
    if (isUpdateSuccessful) {
      res.sendStatus(200);
    }
    else {
      uncleLeeBot.sendMessage(
        22595307,
        "Hello ah boy!\n\n" +

        "The datetime now is: " + Utils.getDateTimeNowSydney() + "\n" +
        "There was an issue with the cron job to fetch the data from the Australian website."
      );
      res.sendStatus(500);
    }
  });
});

// // Listening for the cron job request to push updates to the group chats
// app.get("/grpchat/updates/au-nz", (req, res) => {
//   // Retrieve the group chat message
//   // Some promise here, if we enter the catch, then we send a message to me to notify me of the error
//   // Else if all goes well, broadcast the message
// })

// // On START
// uncleLeeBot.onText(regex.cmdStart, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.from.id,
//     Messages.HELP_MSG,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The HELP command
// uncleLeeBot.onText(regex.cmdHelp, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.chat.id,
//     Messages.HELP_MSG + Messages.PVT_MSG_OPT,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The INFO command
// uncleLeeBot.onText(regex.cmdInfo, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.chat.id,
//     Messages.INFO_MSG + Messages.PVT_MSG_OPT,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The GOING HOME command
// uncleLeeBot.onText(regex.cmdGoingHome, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.chat.id,
//     Messages.GOING_HOME_MSG,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The FLIGHT STATUSES command
// uncleLeeBot.onText(regex.cmdFltStatus, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.chat.id,
//     Messages.FLT_STATUS_MSG,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The CHATS command
// uncleLeeBot.onText(regex.cmdChats, (msg) => {
//   uncleLeeBot.sendMessage(
//     msg.chat.id,
//     Messages.CHAT_GRPS_MSG + Messages.PVT_MSG_OPT,
//     {
//       'reply_to_message_id': msg.message_id,
//     },
//   );
// });

// // The GET (COVID) CASES command
// uncleLeeBot.onText(regex.cmdGetCases, (msg) => {
//   // We need to invoke the Promise-based method to get the values from Firestore
//   covidCases.getCovidCasesAU().then((casesUpdate) => {
//     // Once we have it, we send it to the user's private chat
//     uncleLeeBot.sendMessage(
//       msg.from.id,
//       casesUpdate
//     )
//     .then(() => {
//       if (msg.chat.id !== msg.from.id) {
//         uncleLeeBot.sendMessage(
//           msg.chat.id,
//           "Hey " + msg.from.first_name +
//           ", I've just sent you the details in our private chat!"
//         )
//       }
//     })
//     .catch((error) => {
//       uncleLeeBot.sendMessage(
//         msg.chat.id,
//         "Hey " + msg.from.first_name + 
//         ", I can only provide the details if you tap here: @sgn_help_bot and type /getcases to me directly.",
//         {
//           'reply_to_message_id': msg.message_id,
//         }
//       )
//     });
//   })
// });

// The listener for potential spam messages from user
uncleLeeBot.onText(regex.spamFilter, (msg) => {
  uncleLeeBot.kickChatMember(msg.chat.id, msg.from.id).then((isSuccess) => {
    // If there is an issue with kicking the user, notify me
    if (!isSuccess) {
      uncleLeeBot.sendMessage(
        22595307,
        "Ah boy ah, there was a problem kicking the spammer from the chat."
      )
    }
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                                ADMIN-RELATED COMMANDS FROM HERE
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// This is when the user inputs their group message update
// uncleLeeBot.onText(/\*/, (msg) => {

// });

// This is when a callback query is received, from the pressing of the chat region buttons
uncleLeeBot.on('callback_query', (cbq) => {
  // Here we get the callback query with its ID, and the callback data (groupChatId)
  // We update the database with the callback data, i.e. What group chat ID's message to change
  let userId = cbq.from.id;
  groupAdmin.updateChatIdRef(userId, cbq.data).then((ifSuccess) => {
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
    )
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
              groupAdmin.updateChatIdRef(userReply.from.id, -1)
                .then((isSuccess) => {
                  // If there's an issue, notify me
                  if (!isSuccess) {
                    uncleLeeBot.sendMessage(
                      22595307,
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
                    22595307,
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
});

// The UPDATE GROUP MESSAGE command
uncleLeeBot.onText(/^\/updategrpmsg$/, (msg) => {
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
      uncleLeeBot.sendMessage(
        msg.from.id,
        "Please select the group chat for which the message should be updated:",
        {
          'reply_markup': Utils.createInlineKeyboard(permittedChats),
        }
      )
    }
  });
});

// The FORCE COVID UPDATE command
uncleLeeBot.onText(/^\/forcecovidupdate$/, (msg) => {
  if (msg.from.id === 22595307) {
    // Trigger the pull to update the COVID cases into Firestore
    DataPull.getCovidUpdatesAu().then((isUpdateSuccessful) => {
      let covidUpdateSuccessMsg = "";
      if (isUpdateSuccessful) {
        covidUpdateSuccessMsg = "The COVID cases have been successfully updated for Australia.";
      }
      else {
        covidUpdateSuccessMsg = "There was an issue updating the COVID cases for Australia"
      }
      uncleLeeBot.sendMessage(
        22595307,
        "Hello ah boy!\n\n" +

        "The time now is: " + Utils.getDateTimeNowSydney() + "\n" +
        covidUpdateSuccessMsg
      );
    });
  }
});

// The DIAGNOSTICS command
uncleLeeBot.onText(/\/diagnostics (.+)/, (msg, match) => {
  if (msg.from.id === 22595307) {
    uncleLeeBot.sendMessage(
      22595307,
      "Hello ah boy!\n\n" +

      "The time now is: " + Utils.getDateTimeNowSydney() + "\n" +
      "The chat ID you pinged from is: " + msg.chat.id + "\n" +
      "The title of the chat is: " + msg.chat.title + "\n" +
      "You said: " + match[1],
    );
  }
});

// The ID ME command
uncleLeeBot.onText(/^\/idme$/, (msg) => {
  uncleLeeBot.sendMessage(
    22595307,
    "Hello ah boy! Someone has tried getting themselves ID-ed:\n\n" +
  
    "The chat ID they pinged from is: " + msg.chat.id + "\n" +
    "The title of the chat is: " + msg.chat.title + "\n" +
    "Their first name is: " + msg.from.first_name + "\n" +
    "Their last name is: " + msg.from.last_name + "\n" +
    "Their username is: " + msg.from.username + "\n" +
    "Their user ID is: " + msg.from.id,
  );
});