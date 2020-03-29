module.exports = {
  getBroadcastInfo: (regionName) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats');
    let query = grpChatsRef.where('region', '==', regionName);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return null;
        }

        let chatIdMsgObj = {};

        snapshot.forEach((doc) => {
          chatIdMsgObj[doc.id] = doc.data()['grpChatMsg']
        });

        return chatIdMsgObj;
      })
      .catch((err) => {
        throw err;
      })
  },

  updateGrpChatRegion: (chatId, chatRegion) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats').doc(chatId.toString());
    return grpChatsRef.set({
      'region': chatRegion,
    }, { merge: true})
    .then(() => {
      return true;  // Return true if success
    })
    .catch(() => {
      return false; // Else if there's an error, return false
    })
  },

  regGrpChat: (chatId, chatTitle) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats').doc(chatId.toString());
    return grpChatsRef.set({
      'grpChatMsg': "NIL",
      'grpChatTitle': chatTitle,
      'region': "NIL"
    })
    .then(() => {
      return true;  // Return true if success
    })
    .catch(() => {
      return false; // Else if there's an error, return false
    })
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

  updateGrpChatIdRef: (userId, chatIdToChg) => {
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
        return doc.data()['regionToChatId'];
      })
      .catch((err) => {
        console.log(err);
      })
  }
}