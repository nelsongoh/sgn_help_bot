module.exports = {
  checkUserRegion: () => {

  },

  getCallbackType: (cbqData) => {
    let regex = require('./regex');
    return cbqData.match(regex.cbqType)[0]
  },

  getCallbackValue: (cbqData) => {
    let regex = require('./regex');
    return cbqData.match(regex.cbqValue)[0];
  },

  getCallbackGrpChatId: (cbqData) => {
    let regex = require('./regex');
    return cbqData.match(regex.cbqGrpChatId)[0];
  },

  generateSelectGrpChatMsgUpdate: (btnLabelValueObj) => {
    const Types = require('./type_constants');
    let outputObj = {};
    for (let key in btnLabelValueObj) {
      outputObj[key] = '[t]' + Types.UPDATE_GROUP_MESSAGE + '[/t]' + '[v]' + btnLabelValueObj[key] + '[/v]';
    }
    return outputObj;
  },

  generateRegGrpChatRegions: (grpChatId) => {
    let Types = require('./type_constants');
    let regions = {
      'Singapore': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.SG + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Australia / New Zealand': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.AU_NZ + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Europe / United Kingdom': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.EU_UK + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'North America': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.NA + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Rest of the World': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.ROTW + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]'
    };

    return regions;
  },

  createInlineKeyboard: (btnLabelValueObj) => {
    let inlineKeyboardMarkup = {
      'inline_keyboard': []
    };

    let btnRow = [];
    // For each button label
    for (let key in btnLabelValueObj) {
      // We will only store 2 buttons per row of information
      // If we already have 2 buttons
      if (btnRow.length == 2) {
        // Add it to the keyboard row
        inlineKeyboardMarkup['inline_keyboard'].push(btnRow);
        // Reset the row
        btnRow = [];
      }
      // Create an InlineKeyboardButton
      let inlineKeyboardBtn = {
        'text': key,
        'callback_data': btnLabelValueObj[key].toString(),
      };
      // Add the InlineKeyboardButton into the row
      btnRow.push(inlineKeyboardBtn)
    }
    // If the row is not empty at this point, we add it to the keyboard row
    if (btnRow.length !== 0) {
      inlineKeyboardMarkup['inline_keyboard'].push(btnRow);
      btnRow = [];
    }

    return inlineKeyboardMarkup;
  },

  getDateTimeNowSydney: () => {
    let currDateTime = new Date();
    let currDateTimeStr = currDateTime.toLocaleTimeString(
      'en-SG', {
        timeZone: 'Australia/Sydney'
      }
    ) + ", " +
    currDateTime.toLocaleDateString(
      'en-SG', {
        timeZone: 'Australia/Sydney', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      }
    );

    return currDateTimeStr;
  },

  toDateTimeNowSydney: (theDate) => {
    return theDate.toLocaleTimeString(
      'en-SG', {
        timeZone: 'Australia/Sydney'
      }
    ) + ", " +
    theDate.toLocaleDateString(
      'en-SG', {
        timeZone: 'Australia/Sydney', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      }
    )
  }
}