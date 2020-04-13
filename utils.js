module.exports = {
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
      'Singapore': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.REGION_SG + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Australia / New Zealand': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.REGION_AU_NZ + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Europe / United Kingdom': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.REGION_EU_UK + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'North America': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.REGION_NA + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'Rest of the World': '[t]' + Types.REGISTER_GROUP_CHAT + '[/t][v]' + Types.REGION_ROTW + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]'
    };
    return regions;
  },

  generateRegGrpChatIsSgn: (grpChatId) => {
    let Types = require('./type_constants');
    let isSgn = {
      'Yes': '[t]' + Types.REGISTER_GROUP_CHAT_IS_SGN + '[/t][v]' + true + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
      'No': '[t]' + Types.REGISTER_GROUP_CHAT_IS_SGN + '[/t][v]' + false + '[/v]' + '[gcid]' + grpChatId.toString() + '[/gcid]',
    }
    return isSgn;
  },

  generateCovidCaseReg: () => {
    let Types = require('./type_constants');
    let regions = {
      'Singapore': '[t]' + Types.USER_SELECT_COVID_REGION + '[/t][v]' + Types.REGION_SG + '[/v]',
      'Australia / New Zealand': '[t]' + Types.USER_SELECT_COVID_REGION + '[/t][v]' + Types.REGION_AU_NZ + '[/v]'
    }
    return regions;
  },

  generateHelpMsgReg: () => {
    let Types = require('./type_constants');
    let regions = {
      'Singapore': '[t]' + Types.USER_SELECT_HELP_MSG_REGION + '[/t][v]' + Types.REGION_SG + '[/v]',
      'Australia / New Zealand': '[t]' + Types.USER_SELECT_HELP_MSG_REGION + '[/t][v]' + Types.REGION_AU_NZ + '[/v]'
    }
    return regions;
  },

  generateCBreakerMsgOpts: () => {
    let Types = require('./type_constants');
    let Messages = require('./bot_messages/messages');
    let cBreakerMsgs = Messages.SG_MSGS.CB_RULES_QN_MSG;
    let cBreakerOpts = {}

    cBreakerMsgs.map((ele) => {
      let btnTxt = Object.keys(ele)[0];
      cBreakerOpts[btnTxt] = '[t]' + Types.USER_SELECT_CBREAKER_FAQ_OPT + '[/t][v]' + ele[btnTxt] + '[/v]'
    })
    return cBreakerOpts;
  },

  createInlineKeyboardMarkup: (btnLabelValueObj, rowSize) => {
    let inlineKeyboardMarkup = {
      'inline_keyboard': []
    };

    let btnRow = [];
    // For each button label
    for (let key in btnLabelValueObj) {
      // We will only store "rowSize" buttons per row of information
      // If we already have the number of buttons as specified by the row size
      if (btnRow.length == rowSize) {
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

  getDateTimeNowSingapore: () => {
    let currDateTime = new Date();
    let currDateTimeStr = currDateTime.toLocaleTimeString(
      'en-SG', {
        timeZone: 'Asia/Singapore'
      }
    ) + ", " +
    currDateTime.toLocaleDateString(
      'en-SG', {
        timeZone: 'Asia/Singapore', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      }
    );

    return currDateTimeStr;
  },

  toDateTimeNowSingapore: (theDate) => {
    return theDate.toLocaleTimeString(
      'en-SG', {
        timeZone: 'Asia/Singapore'
      }
    ) + ", " +
    theDate.toLocaleDateString(
      'en-SG', {
        timeZone: 'Asia/Singapore', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      }
    )
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