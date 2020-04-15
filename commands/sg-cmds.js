module.exports = {
  // For the 'budget' command
  onBudget: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.SG_MSGS.BUDGET_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  },

  // For the 'shn' command
  onShn: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.SG_MSGS.SHN_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  },

  // For the 'cbreak' command
  onCbreak: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    let Utils = require('../utils');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.SG_MSGS.CB_RULES_QN_HEADER_MSG,
      {
        'reply_markup': Utils.createInlineKeyboardMarkup(Utils.generateCBreakerMsgOpts(), 1),
      },
    );
  },

  // For the 'groceries' command
  onGroceries: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.SG_MSGS.GROCERIES_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  }
}