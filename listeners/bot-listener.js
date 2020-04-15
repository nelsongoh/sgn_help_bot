module.exports = {
  // To listen for new posts from the official SGN channel 
  onSgnChannelPost: (uncleLeeBot, msg) => {
    let Types = require('../type_constants');
    let groupAdmin = require('../grp-chat');
    let Messages = require('../bot_messages/messages');
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
  },

  // To listen for new group chat members
  onNewMember: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    // We keep tabs on all users that have entered a group chat
    if (msg.chat.id !== msg.from.id) {
      // If this is a message which contains information about new group chat members
      if (typeof msg.new_chat_members !== 'undefined') {
        // We store the members' IDs in the Datastore
        groupAdmin.storeGrpChatMembers(msg.chat.id, msg.chat.title, msg.new_chat_members)
          .then((isSuccess) => {
            if (!(isSuccess)) {
              uncleLeeBot.sendMessage(
                Number(process.env.DOHPAHMINE),
                "Ah boy ah, there was an issue storing the users' details for the group chat:\n\n" + msg.chat.title
              );
            }
          });
      }
    }
  },

  // To listen for group chat members that have left
  onMemberLeave: (uncleLeeBot, msg) => {
    let groupAdmin = require('../grp-chat');
    console.log("A member has left the group chat");
    // We update our list of chat members by removing information about those who have left the chat
    if (msg.chat.id !== msg.from.id) {
      // If this is a message which contains information about a group chat member that left
      if (typeof msg.left_chat_member !== 'undefined') {
        // We remove this member's membership from the group chat
        groupAdmin.removeGrpChatMember(msg.chat.id, msg.left_chat_member)
          .then((isSuccess) => {
            if (!(isSuccess)) {
              uncleLeeBot.sendMessage(
                Number(process.env.DOHPAHMINE),
                "Ah boy ah, there was an issue removing the users' membership details for the group chat:\n\n" + msg.chat.title
              )
            }
          })
      }
    }
  },

  // For spam detection
  detectSpam: (uncleLeeBot, msg) => {
    let spamApi = require('../spam_detect/spam_api');
    if ((typeof msg.text !== 'undefined') || (typeof msg.caption !== 'undefined')) {
      let spamTxt = "";

      if (typeof msg.text !== 'undefined') {
        spamTxt = (msg.text).toString();
      }
      else if (typeof msg.caption !== 'undefined') {
        spamTxt = (msg.caption).toString();
      }

      spamApi.detectMessage(spamTxt).then((isSpam) => {
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
                "For spamming: " + spamTxt
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
  },

  // For forwarded messages from me, for user investigation
  onAdminMsgForward: (uncleLeeBot, msg) => {
    if (typeof msg.forward_from !== 'undefined') {
      // Check if I am in the chat ID with myself and Uncle Lee, and this message came from me (and not Uncle Lee)
      if ((msg.chat.id === msg.from.id) && (msg.from.id === Number(process.env.DOHPAHMINE))) {
        let msgTxt = "";
  
        if (typeof msg.text !== 'undefined') {
          msgTxt = msg.text;
        }
        else if (typeof msg.caption !== 'undefined') {
          msgTxt = msg.caption;
        }
  
        // If the forward_from is not undefined
        if (typeof msg.forward_from !== 'undefined') {
          // Get the details of the forwarded message
          uncleLeeBot.sendMessage(
            Number(process.env.DOHPAHMINE),
            "Ah boy ah,\n\n" +
            "Message from original sender: " + msgTxt + "\n" +
            "Name of original sender: " + msg.forward_from.first_name + " " + msg.forward_from.last_name + "\n" +
            "Username of original sender: " + msg.forward_from.username + "\n" +
            "[ USER ] ID of original sender: " + msg.forward_from.id + "\n" +
            "Details of forwarder:\n\n" +
            "Name of forwarder: " + msg.from.first_name + " " + msg.from.last_name + "\n" +
            "Username of forwarder: " + msg.from.username + "\n" +
            "User ID of forwarder: " + msg.from.id
          );
        }
      }
    }
  },
}