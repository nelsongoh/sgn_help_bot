module.exports = {
  // For the 'gohome' command
  onGoHome: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.AU_MSGS.GOING_HOME_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  },

  // For the 'flts' command
  onFlts: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.AU_MSGS.FLT_STATUS_MSG,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  },

  // For the 'chats' command
  onChats: (uncleLeeBot, msg) => {
    let Messages = require('../bot_messages/messages');
    uncleLeeBot.sendMessage(
      msg.chat.id,
      Messages.AU_MSGS.CHAT_GRPS_MSG + Messages.UTIL_MSGS.PVT_MSG_OPT,
      {
        'reply_to_message_id': msg.message_id,
      },
    );
  }
}