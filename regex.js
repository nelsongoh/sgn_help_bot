module.exports = {
  cmdStart: /^\/start$/i,
  cmdHelp: /^\/help$/i,
  cmdInfo: /^\/info$/i,
  cmdGoingHome: /^\/goinghome$/i,
  cmdFltStatus: /^\/fltstatus$/i,
  cmdChats: /^\/chats$/i,
  cmdGetCases: /^\/getcases$/i,
  adminCmdRegGrpChat: /^\/reggrpchat$/i,
  spamFilter: new RegExp([
    '/',
    '((?=(.|\n)*👇)(?=(.|\n)*bitcoin)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*👇)(?=(.|\n)*crypto)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*👇)(?=(.|\n)*invest)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*invest)(?=(.|\n)*profit)(?=(.|\n)*http))',
    '/i'
  ].join('')),
};