module.exports = {
  cmdStart: /^\/start$/i,
  cmdHelp: /^\/help$/i,
  cmdInfo: /^\/info$/i,
  cmdGoingHome: /^\/goinghome$/i,
  cmdFltStatus: /^\/fltstatus$/i,
  cmdChats: /^\/chats$/i,
  cmdGetCases: /^\/getcases$/i,
  spamFilter: /((?=.*👇)(?=.*bitcoin)(?=.*http))|((?=.*👇)(?=.*crypto)(?=.*http))/,
};