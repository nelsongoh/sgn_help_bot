const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
Promise.config({
  cancellation: true
});
const express = require('express');
const bodyParser = require('body-parser');
const regex = require('./regex');
const botCommands = require('./commands/cmds');
const Listener = require('./listeners/listener');

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
  Listener.cronJobs.onAUCovidCasesFetch(uncleLeeBot, res);
});

// Listening for the CRON JOB request to update the COVID-19 cases for Singapore
app.get("/covid-19/sg/fetch", (req, res) => {
  Listener.cronJobs.onSGCovidCasesFetch(uncleLeeBot, res);
});

// Listening for the CRON JOB request to push updates to the group chats
app.get("/grpchat/updates/au", (req, res) => {
  Listener.cronJobs.onAUAnnounce(uncleLeeBot, res);
});

// Listening for the CRON JOB request to announce COVID-19 cases for Australia (Non-SGN group chats)
app.get("/covid-19/au/announce", (req, res) => {
  Listener.cronJobs.onAUCovidAnnounce(uncleLeeBot, res);
});

// Listening for the CRON JOB request to announce COVID-19 cases for Singapore (Non-SGN group chats)
app.get("/covid-19/sg/announce", (req, res) => {
  Listener.cronJobs.onSGCovidAnnounce(uncleLeeBot, res);
});

// On START
uncleLeeBot.onText(regex.cmdStart, (msg) => {
  botCommands.utilCmds.onStart(uncleLeeBot, msg);
});

// The HELP command
uncleLeeBot.onText(regex.cmdHelp, (msg) => {
  // Check if this is a group chat, or a 1-to-1 chat
  // If this is a 1-to-1 chat, we need to ask the user which region's help message they're looking for
  if (msg.chat.id === msg.from.id) {
    botCommands.utilCmds.onHelpSolo(uncleLeeBot, msg);
  }
  // Else if this is a group chat, we check which region this group chat belongs to
  else {
    botCommands.utilCmds.onHelpGrp(uncleLeeBot, msg);
  }
});

// The INFO command
uncleLeeBot.onText(regex.cmdInfo, (msg) => {
  botCommands.utilCmds.onInfo(uncleLeeBot, msg);
});

// The GOING HOME command
uncleLeeBot.onText(regex.cmdGoingHome, (msg) => {
  botCommands.AUCmds.onGoHome(uncleLeeBot, msg);
});

// The FLIGHT STATUSES command
uncleLeeBot.onText(regex.cmdFltStatus, (msg) => {
  botCommands.AUCmds.onFlts(uncleLeeBot, msg);
});

// The CHATS command
uncleLeeBot.onText(regex.cmdChats, (msg) => {
  botCommands.AUCmds.onChats(uncleLeeBot, msg);
});

// The GET (COVID) CASES command
uncleLeeBot.onText(regex.cmdGetCases, (msg) => {
  // If this is coming from an individual's get request
  if (msg.chat.id === msg.from.id) {
    botCommands.globalCmds.onGetCasesSolo(uncleLeeBot, msg);
  }
  else {
    botCommands.globalCmds.onGetCasesGrp(uncleLeeBot, msg);
  }
});

// The BUDGET command
uncleLeeBot.onText(regex.cmdBudget, (msg) => {
  botCommands.SGCmds.onBudget(uncleLeeBot, msg);
});

// The SHN command
uncleLeeBot.onText(regex.cmdShn, (msg) => {
  botCommands.SGCmds.onShn(uncleLeeBot, msg);
});

// The CBREAK command
uncleLeeBot.onText(regex.cmdCBreak, (msg) => {
  botCommands.SGCmds.onCbreak(uncleLeeBot, msg);
});

// The GROCERIES command
uncleLeeBot.onText(regex.cmdGroceries, (msg) => {
  botCommands.SGCmds.onGroceries(uncleLeeBot, msg);
});

// The listener for official SGN channel announcements
uncleLeeBot.on('channel_post', (msg) => {
  Listener.botListener.onSgnChannelPost(uncleLeeBot, msg);
});

// The listener for new users who joined group chats
uncleLeeBot.on('new_chat_members', (msg) => {
  Listener.botListener.onNewMember(uncleLeeBot, msg);
});

// The listener for users who have left group chats 
// (Note: This is not used since no 'left chat' messages are made on the group chats)
uncleLeeBot.on('left_chat_member', (msg) => {
  Listener.botListener.onMemberLeave(uncleLeeBot, msg);
});

// The listener for messages from users
uncleLeeBot.on('message', (msg) => {
  // We do a spam analysis on the message, if the text or caption isn't empty
  Listener.botListener.detectSpam(uncleLeeBot, msg);
  // If we have a forwarded message from myself, then start getting details about the original sender
  Listener.botListener.onAdminMsgForward(uncleLeeBot, msg);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                                ADMIN-RELATED COMMANDS FROM HERE
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// To add a group chat to the datastore
uncleLeeBot.onText(regex.adminCmdRegGrpChat, (msg) => {
  botCommands.Admin.onRegisterGroup(uncleLeeBot, msg);
});

// This is when a callback query is received, from the pressing of the chat region buttons
uncleLeeBot.on('callback_query', (cbq) => {
  Listener.callbackQueries.cbqManager(uncleLeeBot, cbq);
});

// The BAN USER command (From all SGN group chats that the bot administrates)
uncleLeeBot.onText(regex.adminBanHammer, (msg) => {
  botCommands.Admin.banUserById(uncleLeeBot, msg);
})

// The UPDATE GROUP MESSAGE command
uncleLeeBot.onText(regex.adminUpdateGrpMsg, (msg) => {
  botCommands.Admin.onUpdateGrpMsg(uncleLeeBot, msg);
});

// The FORCE COVID UPDATE command
uncleLeeBot.onText(regex.adminForceCovidUpdate, (msg) => {
  botCommands.Admin.onForceCovidUpdate(uncleLeeBot, msg);
});

// The DIAGNOSTICS command
uncleLeeBot.onText(regex.adminRunDiagnostics, (msg, match) => {
  botCommands.Admin.onGrpChatDiag(uncleLeeBot, msg, match);
});

// The ID ME command
uncleLeeBot.onText(regex.cmdIdMe, (msg) => {
  botCommands.Admin.onIdMe(uncleLeeBot, msg);
});
