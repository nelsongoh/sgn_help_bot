module.exports = {
  // Regex for general public commands
  cmdStart: /^\/start$/i,
  cmdHelp: /^help$/i,
  cmdInfo: /^info$/i,
  cmdGoingHome: /^gohome$/i,
  cmdFltStatus: /^flts$/i,
  cmdChats: /^chats$/i,
  cmdGetCases: /^getcases$/i,
  cmdIdMe: /^idme$/,
  cmdBudget: /^budget$/,
  cmdShn: /^shn$/,
  cmdCBreak: /^cbreak$/,
  cmdGroceries: /^groceries$/,
  // Regex for admin commands
  adminCmdRegGrpChat: /^\/reggrpchat$/i,
  adminUpdateGrpMsg: /^\/updategrpmsg$/,
  adminForceCovidUpdate: /^\/forcecovidupdate$/,
  adminRunDiagnostics: /^\/rundiagnostics (.+)$/,
  adminBanHammer: /^\/ban (.+)$/,
  adminNehaSays: /^\/nehasays (.+)$/,
  // Regex for matching values in callback queries
  cbqType: /(?<=\[t\])(.*)(?=\[\/t\])/g,
  cbqValue: /(?<=\[v\])(.*)(?=\[\/v\])/g,
  cbqGrpChatId: /(?<=\[gcid\])(.*)(?=\[\/gcid\])/g,
};