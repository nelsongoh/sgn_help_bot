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
  adminBanHammer: /^\/ban (.+)$/,
  adminNehaSays: /^\/nehasays (.+)$/,
  // Regex for matching values in callback queries
  cbqType: /(?<=\[t\])(.*)(?=\[\/t\])/g,
  cbqValue: /(?<=\[v\])(.*)(?=\[\/v\])/g,
  cbqGrpChatId: /(?<=\[gcid\])(.*)(?=\[\/gcid\])/g,
  // Regex for the spam filter
  spamFilter: new RegExp([
    '/',
    // If the keywords are: trad AND (bitcoin / bit coin OR crypto OR profit) AND (telegram link OR phone number)
    '((?=(.|\n)*trad)((?=(.|\n)*bit( ?)coin)|(?=(.|\n)*crypto)|(?=(.|\n)*profit))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are bitcoin / bit coin AND (trad OR crypto OR profit) AND (telegram link OR phone number)
    '((?=(.|\n)*bit( ?)coin)((?=(.|\n)*trad)|(?=(.|\n)*crypto)|(?=(.|\n)*profit))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are profit AND (bitcoin / bit coin OR trad OR crypto) AND (telegram link OR phone number)
    '((?=(.|\n)*profit)((?=(.|\n)*bit( ?)coin)|(?=(.|\n)*trad)|(?=(.|\n)*crypto))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: invest AND (trad OR cap OR pay) AND (telegram link OR phone number)
    '((?=(.|\n)*invest)((?=(.|\n)*trad)|(?=(.|\n)*cap)|(?=(.|\n)*pay))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are: trad AND (invest OR cap OR pay) AND (telegram link OR phone number)
    '((?=(.|\n)*trad)((?=(.|\n)*invest)|(?=(.|\n)*cap)|(?=(.|\n)*pay))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are: pay AND (invest OR cap OR trad) AND (telegram link OR phone number)
    '((?=(.|\n)*pay)((?=(.|\n)*invest)|(?=(.|\n)*cap)|(?=(.|\n)*trad))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // These are specific banned chat groups
    '(?=(.|\n)*AAAAAFY3TYmivxjQejlZPA)', '|',
    '(?=(.|\n)*AAAAAFDE45as4-4bvyhcYg)', '|',
    '(?=(.|\n)*AAAAAFXxeszLtcGrtm77zQ)', '|',
    '(?=(.|\n)*AAAAAFTT2-iEJvoBrlrexA)', '|',

    // These are specific websites banned
    '(?=(.|\n)*blockchain.com)', '|',
    '(?=(.|\n)*bit-montage)', '|',

    // If the keywords are: thank AND (finan OR invest OR earn OR trad) AND (telegram link OR phone number)
    '((?=(.|\n)*thank)((?=(.|\n)*finan)|(?=(.|\n)*invest)|(?=(.|\n)*earn)|(?=(.|\n)*trad))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: finan AND (thank OR invest OR earn OR trad) AND (telegram link OR phone number)
    '((?=(.|\n)*finan)((?=(.|\n)*thank)|(?=(.|\n)*invest)|(?=(.|\n)*earn)|(?=(.|\n)*trad))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are: earn AND (thank OR invest OR finan OR trad) AND (telegram link OR phone number)
    '((?=(.|\n)*earn)((?=(.|\n)*thank)|(?=(.|\n)*invest)|(?=(.|\n)*finan)|(?=(.|\n)*trad))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are: trad AND (thank OR finan OR earn) AND (telegram link OR phone number)
    // NOTE: trad AND invest is covered in the filter above
    '((?=(.|\n)*trad)((?=(.|\n)*thank)|(?=(.|\n)*finan)|(?=(.|\n)*trad))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: (invest OR cap OR finan OR contact) AND $ AND (telegram link OR phone number)
    '(((?=(.|\n)*invest)|(?=(.|\n)*cap)|(?=(.|\n)*finan)|(?=(.|\n)*contact))(?=(.|\n)*\$)' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: income
    '((?=(.|\n)*income)(?=(.|\n)*t.me\/))', '|',

    // If the keywords are: loan AND credit
    '((?=(.|\n)*loan)(?=(.|\n)*credit))', '|',

    // If the keywords are: trad AND (profit OR cash) AND (telegram link OR phone number)
    '((?=(.|\n)*trad)((?=(.|\n)*profit)|(?=(.|\n)*cash))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    // If the keywords are: profit AND (trad OR cash) AND (telegram link OR phone number)
    '((?=(.|\n)*profit)((?=(.|\n)*trad)|(?=(.|\n)*cash))' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: loan AND cash AND (telegram link OR phone number)
    '((?=(.|\n)*loan)(?=(.|\n)*cash)' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',

    // If the keywords are: contact AND (telegram link OR phone number)
    '((?=(.|\n)*contact)' +
    '((?=(.|\\n)*t.me\/)|(?=(.|\\n)*(\\+?\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})))', '|',
    
    // If there's this specific domain mentioned
    '((?=(.|\n)*.page.link))', // LAST ENTRY CANNOT HAVE A PIPE OPERATOR
    '/i'
  ].join('')),
};