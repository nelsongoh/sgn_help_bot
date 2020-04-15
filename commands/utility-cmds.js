module.exports = {
  // The /start command
  onStart: (uncleLeeBot, msg) => {
    let Utils = require('../utils');
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
  },

  // The 'help' command for 1-on-1 chats with the bot
  onHelpSolo: (uncleLeeBot, msg) => {
    let Utils = require('../utils');
    // Send out a inline keyboard button to let them choose
    uncleLeeBot.sendMessage(
      msg.chat.id,
      "Which region's help message would you like to see?",
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateHelpMsgReg(), 2)
      }
    );
  },

  // The 'help' command for group chats with the bot
  onHelpGrp: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    let Messages = require('../bot_messages/messages');
    let Types = require('../type_constants');
    groupAdmin.getRegionFromChatId(msg.chat.id)
      .then((grpChatRegion) => {
        // With the group chat region, we reply with the appropriate help message
        let helpMsg = "";
        if (grpChatRegion == Types.REGION_SG) {
          helpMsg = Messages.SG_MSGS.HELP_MSG;
        }
        else if (grpChatRegion == Types.REGION_AU) {
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
  },

  // The 'info' command
  onInfo: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.UTIL_MSGS.INFO_MSG + Messages.UTIL_MSGS.PVT_MSG_OPT,
      {
        'reply_to_message_id': msg.message_id
      },
    );
  },
}