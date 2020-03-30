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
  // Regex for admin commands
  adminCmdRegGrpChat: /^\/reggrpchat$/i,
  adminUpdateGrpMsg: /^\/updategrpmsg$/,
  adminForceCovidUpdate: /^\/forcecovidupdate$/,
  adminRunDiagnostics: /^\/rundiagnostics (.+)$/,
  // Regex for matching values in callback queries
  cbqType: /(?<=\[t\])(.*)(?=\[\/t\])/g,
  cbqValue: /(?<=\[v\])(.*)(?=\[\/v\])/g,
  cbqGrpChatId: /(?<=\[gcid\])(.*)(?=\[\/gcid\])/g,
  // Regex for the spam filter
  spamFilter: new RegExp([
    '/',
    '((?=(.|\n)*trad)(?=(.|\n)*bit( ?)coin)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*crypto)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*invest)(?=(.|\n)*http))', '|',
    '(?=(.|\n)*AAAAAFY3TYmivxjQejlZPA)', '|',
    '(?=(.|\n)*AAAAAFDE45as4-4bvyhcYg)',
    '(?=(.|\n)*AAAAAFXxeszLtcGrtm77zQ)',
    '(?=(.|\n)*AAAAAFTT2-iEJvoBrlrexA)',
    '((?=(.|\n)*thank)(?=(.|\n)*fin)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*thank)(?=(.|\n)*invest)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*thank)(?=(.|\n)*earn)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*cap)(?=(.|\n)*\$)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*pay)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*income)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*earn)(?=(.|\n)*trad)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*loan)(?=(.|\n)*credit))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*profit)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*cash)(?=(.|\n)*profit)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*cash)(?=(.|\n)*trad)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*loan)(?=(.|\n)*cash)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*profit)(?=(.|\n)*bit( ?)coin)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*profit)(?=(.|\n)*crypto)(?=(.|\n)*http))', '|',
    '((?=(.|\n)*contact)(?=(.|\n)*t.me\/joinchat))', // LAST ENTRY CANNOT HAVE A PIPE OPERATOR
    '/i'
  ].join('')),
};