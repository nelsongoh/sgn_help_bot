module.exports = {
  // Regex for general public commands
  cmdStart: /^\/start$/i,
  cmdHelp: /^\/help$/i,
  cmdInfo: /^\/info$/i,
  cmdGoingHome: /^\/goinghome$/i,
  cmdFltStatus: /^\/fltstatus$/i,
  cmdChats: /^\/chats$/i,
  cmdGetCases: /^\/getcases$/i,
  // Regex for admin commands
  adminCmdRegGrpChat: /^\/reggrpchat$/i,
  // Regex for matching values in callback queries
  cbqType: /(?<=<cbq_type>)(.*)(?=<\/cbq_type>)/g,
  cbqValue: /(?<=<value>)(.*)(?=<\/value>)/g,
  // Regex for the spam filter
  spamFilter: new RegExp([
    '/',
    '((?=(.|\n)*👇)(?=(.|\n)*bitcoin)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*👇)(?=(.|\n)*crypto)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*👇)(?=(.|\n)*invest)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*invest)(?=(.|\n)*profit)(?=(.|\n)*http))', '|',
    '(?=(.|\n)*AAAAAFY3TYmivxjQejlZPA)', '|',
    '(?=(.|\n)*AAAAAFDE45as4-4bvyhcYg)',
    '/i'
  ].join('')),
};