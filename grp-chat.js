module.exports = {
  removeGrpChatMember: (grpChatId, exGrpChatUser) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatMembRef = db.collection('grpChatMembers').doc((exGrpChatUser.id).toString());

    return db.runTransaction((t) => {
      return t.get(grpChatMembRef)
        .then((doc) => {
          // If the document doesn't exist, i.e. We never got this member's details,
          // We'll store information about their account
          if (!doc.exists) {
            let userUpdate = {
              first_name: exGrpChatUser.first_name
            }

            if (typeof exGrpChatUser.last_name !== 'undefined') {
              userUpdate['last_name'] = exGrpChatUser.last_name;
            }
            else {
              userUpdate['last_name'] = '';
            }

            if (typeof exGrpChatUser.username !== 'undefined') {
              userUpdate['username'] = exGrpChatUser.username;
            }
            else {
              userUpdate['username'] = '';
            }

            t.set(grpChatMembRef, userUpdate);
          }
          // Else if the member exists, we just remove their membership from that group chat
          else {
            let currGrpChatMembership = doc.data().grpChats;
            // If the membership exists in their records, we remove it and update it, else we do nothing
            if (currGrpChatMembership.hasOwnProperty(grpChatId.toString())) {
              delete currGrpChatMembership[grpChatId.toString()];
              console.log(currGrpChatMembership);
              t.update(grpChatMembRef, {'grpChats': currGrpChatMembership});
            }
          }
        });
    })
    .then((result) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
  },

  storeGrpChatMembers: (grpChatId, grpChatTitle, grpChatUsers) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let promises = grpChatUsers.map((user) => {
      let grpChatMembRef = db.collection('grpChatMembers').doc((user.id).toString());
      let userUpdate = {
        first_name: user.first_name
      }
      
      if (typeof user.last_name !== 'undefined') {
        userUpdate['last_name'] = user.last_name;
      }
      else {
        userUpdate['last_name'] = '';
      }

      if (typeof user.username !== 'undefined') {
        userUpdate['username'] = user.username;
      }
      else {
        userUpdate['username'] = '';
      }

      return db.runTransaction((t) => {
        return t.get(grpChatMembRef)
          .then((doc) => {
            // If the document doesn't exist, we initialize it
            if (!doc.exists) {
              userUpdate['grpChats'] = {};
              userUpdate['grpChats'][grpChatId.toString()] = grpChatTitle;
            }
            // Else if it does exist, we just update it
            else {
              let currGrpChatMembership = doc.data().grpChats;
              currGrpChatMembership[grpChatId.toString()] = grpChatTitle;
              userUpdate['grpChats'] = currGrpChatMembership;
            }
            // Then we update the entry
            t.set(grpChatMembRef, userUpdate);
          });
      });
    });

    return Promise.all(promises)
      .then((result) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  },

  getGrpChatNameWithId: (grpChatId) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats').doc(grpChatId.toString());
    
    return grpChatsRef.get()
      .then((doc) => {
        if (!doc.exists) {
          return null;
        }

        let grpChatName = doc.data()['grpChatTitle'];
        return grpChatName;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      })
  },

  getChatIdsFromNonSgnRegion: (regionName) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats');
    let query = grpChatsRef.where('region', '==', regionName).where('isSgn', '==', false);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return null;
        }

        let chatIds = [];

        snapshot.forEach((doc) => {
          chatIds.push(doc.id);
        });

        return chatIds;
      })
      .catch((err) => {
        throw err;
      })
  },

  getRegionFromChatId: (chatId) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats').doc(chatId.toString());

    return grpChatsRef.get()
      .then((doc) => {
        if (!doc.exists) {
          return null;
        }

        let grpChatRegion = doc.data()['region'];
        return grpChatRegion;
      })
      .catch((err) => {
        throw err;
      })
  },

  getAllSgnChats: () => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats');
    let query = grpChatsRef.where('isSgn', '==', true);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return null;
        }

        let grpChatIds = [];

        snapshot.forEach((doc) => {
          grpChatIds.push(doc.id);
        });

        return grpChatIds;
      })
      .catch((err) => {
        throw err;
      })
  },

  getChatIdsFromRegion: (regionName) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats');
    let query = grpChatsRef.where('region', '==', regionName);

    return query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          return null;
        }

        let chatIds = [];

        snapshot.forEach((doc) => {
          chatIds.push(doc.id);
        });

        return chatIds;
      })
      .catch((err) => {
        throw err;
      })
  },

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

  updateGrpChatIsSgn: (grpChatId, isSgn) => {
    let Firestore = require('@google-cloud/firestore');
    let db = new Firestore();

    let grpChatsRef = db.collection('grpChats').doc(grpChatId.toString());
    return grpChatsRef.set({
      'isSgn': isSgn,
    }, { merge: true})
    .then(() => {
      return true;  // Return true if success
    })
    .catch(() => {
      return false; // Else if there's an error, return false
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
      'isSgn': true,
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