module.exports = {
  // Regex for general public commands
  cmdStart: /^\/start$/i,
  cmdHelp: /^help$/i,
  cmdInfo: /^info$/i,
  cmdGoingHome: /^gohome$/i,
  cmdFltStatus: /^flts$/i,
  cmdChats: /^chats$/i,
  cmdGetCases: /^getcases$/i,
  cmdIdMe: /^idme$/i,
  cmdBudget: /^budget$/i,
  cmdShn: /^shn$/i,
  cmdCBreak: /^cbreak$/i,
  cmdGroceries: /^groceries$/i,
  // Regex for admin commands
  adminCmdRegGrpChat: /^\/reggrpchat$/i,
  adminUpdateGrpMsg: /^\/updategrpmsg$/i,
  adminForceCovidUpdate: /^\/forcecovidupdate$/i,
  adminRunDiagnostics: /^\/rundiagnostics (.+)$/i,
  adminBanHammer: /^\/ban (.+)$/i,
  adminNehaSays: /^\/nehasays (.+)$/i,
  // Regex for matching values in callback queries
  cbqType: /(?<=\[t\])(.*)(?=\[\/t\])/g,
  cbqValue: /(?<=\[v\])(.*)(?=\[\/v\])/g,
  cbqGrpChatId: /(?<=\[gcid\])(.*)(?=\[\/gcid\])/g,
};