module.exports = {
  checkUserRegion: () => {

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