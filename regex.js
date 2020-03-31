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
    '((?=(.|\n)*trad)(?=(.|\n)*bit( ?)coin)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*crypto)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*invest)(?=(.|\n)*t.me\/))', '|',
    '(?=(.|\n)*AAAAAFY3TYmivxjQejlZPA)', '|',
    '(?=(.|\n)*AAAAAFDE45as4-4bvyhcYg)', '|',
    '(?=(.|\n)*AAAAAFXxeszLtcGrtm77zQ)', '|',
    '(?=(.|\n)*AAAAAFTT2-iEJvoBrlrexA)', '|',
    '((?=(.|\n)*thank)(?=(.|\n)*finan)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*thank)(?=(.|\n)*invest)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*thank)(?=(.|\n)*earn)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*cap)(?=(.|\n)*\$)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*pay)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*income)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*earn)(?=(.|\n)*trad)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*loan)(?=(.|\n)*credit))', '|',
    '((?=(.|\n)*trad)(?=(.|\n)*profit)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*cash)(?=(.|\n)*profit)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*cash)(?=(.|\n)*trad)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*loan)(?=(.|\n)*cash)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*profit)(?=(.|\n)*bit( ?)coin)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*profit)(?=(.|\n)*crypto)(?=(.|\n)*t.me\/))', '|',
    '((?=(.|\n)*contact)(?=(.|\n)*t.me\/))', // LAST ENTRY CANNOT HAVE A PIPE OPERATOR
    '/i'
  ].join('')),
};