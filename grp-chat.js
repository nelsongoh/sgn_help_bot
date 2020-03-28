module.exports = {
  getGrpChatMsg: (regionName) => {
    this.getGroupChatIdViaRegion(regionName)
      .then((chatId) => {
        // Using the group chat ID, retrieve the group chat message to broadcast
        // DB ACTION HERE
      })
      .catch((err) => {
        throw err;
      })
  },

  getGroupChatIdViaRegion: (regionName) => {
    
  },

  getListenerId: (userId) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatAdminsRef = db.collection('grpChatAdmins').doc(userId.toString());
    return grpChatAdminsRef.get()
      .then((doc) => {
        let listenerId = doc.data().botListenerId
        return listenerId;
      })
      .catch((err) => {
        return false;
      })
  },

  storeListenerId: (userId, listenerId) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatAdminsRef = db.collection('grpChatAdmins').doc(userId.toString());
    return grpChatAdminsRef.update({
      'botListenerId': Number(listenerId)
    })
    .then(() => {
      return true;
    })
    .catch((err) => {
      return false;
    })
  },

  updateGrpChatMsg: (userId, newGrpChatMsg) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    // Get the ID of the group chat whose message we wanna change
    let grpChatAdminsRef = db.collection('grpChatAdmins').doc(userId.toString());
    return grpChatAdminsRef.get()
      .then((doc) => {
        let chatIdToChg = doc.data().grpChatIdMsgToChg;

        return chatIdToChg;
      })
      .then((chatIdToChg) => {
        // Then we update the group chat's message
        let grpChatsRef = db.collection('grpChats').doc(chatIdToChg.toString());

        return grpChatsRef.update({
          'grpChatMsg': newGrpChatMsg
        })
        .then(() => {
          // If successful, we return true
          return true
        })
        .catch((err) => {
          return false;
        })
      })
      .catch((err) => {
        return false;
      });
  },

  updateChatIdRef: (userId, chatIdToChg) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatAdminsRef = db.collection('grpChatAdmins').doc(userId.toString());

    return grpChatAdminsRef.update({
      'grpChatIdMsgToChg': Number(chatIdToChg)
    })
    .then(() => {
      return true;
    })
    .catch((err) => {
      return false;
    })
  },

  getAuthGrpChats: (adminId) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatAdminsRef = db.collection('grpChatAdmins').doc(adminId.toString());

    return grpChatAdminsRef.get()
      .then((doc) => {
        if (!doc.exists) {
          return null;
        }

        let dataObj = doc.data()['regionToChatId'];

        return dataObj;
      })
      .catch((err) => {
        console.log(err);
      })
  }
}