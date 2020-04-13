// This file contains Singapore-related help messages
module.exports = {
  HELP_MSG: "Here are some possible commands to help you get started:\n\n" +

  "To get started, type one of the commands. For example, just type the word: getcases\n\n" +

  "cbreak - This provides information regarding the Circuit Breaker measures\n\n" +
  "budget - This provides more information regarding the Solidarity payments from the Resilience Budget 2020\n\n" +
  "getcases - This provides the current number of COVID cases in Singapore\n\n" +
  "shn - For more information regarding the Stay-Home-Notice\n\n" +
  "groceries - Community-based information regarding online grocery shopping options",

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  BUDGET_MSG: "As part of the effort to help support Singaporeans and families during this challenging period of " +
  "COVID-19, the Singapore government will be disbursing cash payouts to help us along the way. Here's a summary of " +
  "the budget:\n\n" +

  "For all adult Singaporeans:\n" +
  "14th April 2020: $600 will be deposited directly into your bank account used for previous government payouts, " +
  "e.g. SG Bonus (2018), GST Voucher.\n\n" +

  "23rd April 2020: Singaporeans who have not received the government payouts can provide their details BY 23rd APRIL " +
  "at go.gov.sg/spsc and payment will be made by 28 April 2020.\n\n" +

  "Note: Singaporeans who do not provide bank account details will receive the payment via mailed cheque from " +
  "30th April onwards.\n\n" +

  "For adult PRs and LTVP+ Holders:\n" +
  "This is eligible for adult PRs with Singaporean parent(s), spouse, or child(ren). Adult PR must reside in Singapore.\n\n" +
  
  "10th May 2020: Eligible PRs can apply with bank account details by 10th May at go.gov.sg/sppr and payment will " +
  "be made on 19th May 2020.\n\n" +

  "From end-May: LTVP+ holders will receive payment by cheque via post, no action is required.\n\n" +

  "Note: PRs who apply without bank account details will receive the payment by mailed cheque from end-May.\n\n" +

  "For more information, please visit: go.gov.sg/sp2020",

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  SHN_MSG: "Some freqently asked questions:\n\n" +

  "1) I am returning to Singapore after 9 April, 2359hrs. Am I allowed to make separate arrangements if I do not " +
  "want to stay in the Government-provided dedicated SHN hotels?\n\n" +

  "All returnees to Singapore are required to serve their 14-day SHN in the dedicated hotels. This is to ensure that " +
  "proper and timely medical care can be provided to you if needed and it will also help minimize the risk of " +
  "spread to others. For those with extenuating circumstances, such as medical conditions or mobility issues, " +
  "please provide the details in this form at www.go.gov.sg/shnhotelneeds. They can also contact the SHN Helpline " +
  "at +65 6812 5555 for more information.\n\n" +

  "2) How can I calculate my total SHN-stay period? \n\n" +

  "The Ministry of Manpower has provided a SHN / LOA calculator for you to verify your total length of stay required " +
  "during this period. Please check it at: https://service2.mom.gov.sg/shn/shn-calculator/" +

  "3) Am I supposed to be contacted by the authorities to verify my location during the SHN?\n\n" +

  "During this period, the authorities may contact you via Whatsapp or pay you a physical visit to ensure that " +
  "you are keeping to the SHN / LOA rules. Based on community answers, some forms of contact may include having " +
  "the hotel staff check up on you on behalf of the authorities instead.\n\n" +

  "4) Can I have food / items that I need, delivered to me during the stay?\n\n" +

  "Yes you may - Food delivery services and / or family members may leave their items at the reception, and the " +
  "hotel staff will deliver it to your room.\n\n" +

  "For more information, you can read the full FAQ here: " +
  "https://www.singaporeglobalnetwork.com/docs/FAQs-for-Returning-Singaporeans.pdf",

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  CB_RULES_QN_HEADER_MSG: "Here are the latest rules on the Circuit Breaker measures:\n\n" + 
  
  "For more information, please visit: " +
  "https://www.gov.sg/article/what-you-can-and-cannot-do-during-the-circuit-breaker-period\nor\n" +
  "https://www.moh.gov.sg/covid-19/faqs\n\n",

  CB_RULES_QN_MSG: [
    {"When can I leave the house?": "cbreak_0"},
    {"When can I enter another person's house?": "cbreak_1"},
    {"What is considered an essential service?": "cbreak_2"},
    {"Should I wear a mask when I go out?": "cbreak_3"},
    {"Can I still meet my friends / relatives?": "cbreak_4"},
    {"Some of my elderly family members need help with their daily needs. Can I still visit them?": "cbreak_5"},
    {"Are we allowed to go to extended family members' houses for caregiving purposes?": "cbreak_6"},
    {"Can I still accompany my elderly parent, living in a different household, to medical appointments?": "cbreak_7"},
    {"Can I still check on my neighbour who is a senior, and is living alone?": "cbreak_8"},
    {"Can I call for a repairman to come fix my utility / appliance issues?": "cbreak_9"},
    {"Can I continue private face-to-face home tuition for my child?": "cbreak_10"},
    {"Can I continue to exercise or engage in recreational activities?": "cbreak_11"}
  ],

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  CB_RULES_ANS_MSG: {
    "cbreak_0": "You may only leave the house for 1 or more of the following reasons:\n\n" +
    "1) To work for or with an essential service provider, specified schools or early childhood development centres\n\n" +
    "2) To send your child to childcare if you and your spouse work for an essential service provider\n\n" +
    "3) To get essential goods and services like buying groceries, cutting hair or doing laundry\n\n" +
    "4) To exercise ALONE or with OTHERS YOU LIVE WITH in green or open spaces\n\n" +
    "5) To seek medical help for suspected COVID-19 infection or other urgent treatment\n\n" +
    "6) To provide assistance to seniors (60 years and above) or individuals with physical or mental disability\n\n" +
    "7) To seek or render help in an emergency\n\n" +
    "8) To comply with the law (eg. court order)\n\n" +
    "9) To report for National Service\n\n" +
    "10) To move house\n\n" +
    "11) To leave Singapore\n\n" +
    "NOTE: Whenever you leave the house, you must keep a distance of at least one metre from others, " +
    "with the exception of lifts, vehicles and public transport-related premises.",

    "cbreak_1": "You may only go into another person’s house to:\n\n" +
    "1) Deliver essential goods or services\n\n" +
    "2) Provide assistance to a senior (60 years old and above) or an individual with physical or mental disability\n\n" +
    "3) Seek or render help in an emergency",

    "cbreak_2": "Essential services include those involved in the provision of food, health and social services, " +
    "transportation, and activities of daily living e.g. haircuts. The full list of essential services can be found " +
    "here: https://covid.gobusiness.gov.sg/essentialservices",

    "cbreak_3": "Essential service workers who come into frequent contact with members of the public " +
    "(e.g. food handlers/hawkers/food delivery staff) should wear a mask. For everyone else, stay home unless " +
    "absolutely necessary to go out, in which case, you should also wear a mask when you are unavoidably in " +
    "situations where you come into closer proximity with other people, such as at wet markets, supermarkets or " +
    "public transport).\n\n" +
    "For the general public, you are advised to stay home and avoid interactions with anyone other than immediate " +
    "family members living in the same household. For those who need to go out, and are unable to avoid close contact " +
    "with others, then wearing a mask could provide some basic protection for others, and yourself.",

    "cbreak_4": "No. All social gatherings, such as private parties and social get-togethers with friends and relatives " +
    "and family members not within the same household, should stop during this period. This is to prevent the " +
    "spread of COVID-19 through such social interactions.",

    "cbreak_5": "Yes, where necessary, individuals can still visit elderly family members to assist with their daily needs. " +
    "Please take the necessary safe distancing precautions while you are there, such as observing personal " +
    "hygiene and ensuring your hands are clean, minimising physical contact and maintaining a safe separation " +
    "as much as possible. DO NOT VISIT if you are UNWELL.\n\n" +
    "Where possible, we strongly recommend for family members to support their elderly relatives who do not stay " +
    "with them by keeping in contact through phone or video calls, or bringing them groceries, food and other " +
    "essential supplies to assist with their daily needs. This is to avoid seniors having to make trips out of " +
    "the home for such activities.",

    "cbreak_6": "The objective of the circuit breaker measures is to significantly reduce movements and social interactions, " +
    "especially for seniors who are more vulnerable to COVID-19 infection.\n\n" +
    "Grandparents can continue to care for their grandchildren if the grandchildren stay with them throughout " +
    "this period. We strongly urge seniors to stay at home and avoid going out. You should not drop off your " +
    "children with their grandparents on a daily basis as this increases the risk of transmission. However, " +
    "exemptions can be made if you belong to one of the following groups:\n\n" +
    "1) Both parents are essential service workers and unable to work from home;\n" +
    "2) One parent is a healthcare professional (e.g. doctor, nurse, allied health professional, support care staff) " +
    "and is unable to work from home; and\n" +
    "3) One parent is an essential service worker who is unable to work from home, and have a child/children " +
    "below the age of three.\n\n" +
    "Social gatherings, such as private parties and social get-togethers with friends and relatives and " +
    "family members not within the same household, are DISALLOWED.",

    "cbreak_7": "Yes, you can continue to accompany your elderly parent to medical appointments but please take additional " +
    "precautions such as wearing a mask and ensuring good personal hygiene while you are in contact with him or her.",

    "cbreak_8": "Yes, you may continue to provide assistance to her for her daily needs, but unless absolutely necessary, " +
    "this should not be done with physical interaction. If you have any physical interaction, please take the " +
    "necessary safe distancing precautions, such as observing personal hygiene and ensuring your hands are clean, " +
    "minimising physical contact and maintaining a safe separation as much as possible. " + 
    "DO NOT VISIT if you are UNWELL.\n\n" +
    "If you know of a senior e.g. neighbour, friend, family member, who needs assistance with their daily needs, " +
    "please contact the AIC hotline at 1800-650-6060.",

    "cbreak_9": "Yes if these are for emergency household services. Please observe safe distancing measures while the " +
    "repair staff is at your house.\n\n" +
    "Other essential services permitted are plumbers, electricians, locksmiths, repair of consumer electronics / " +
    "IT peripherals / household appliances, and healthcare and veterinary services.",

    "cbreak_10": "No. You should limit social contact to individuals living in the same household. Private tutors must " +
    "suspend all face-to-face lessons.",

    "cbreak_11": "You may still exercise, on your own or with members of your household, around your immediate neighbourhood " +
    "in open, uncrowded places. Greens and open spaces will remain open, but gatherings in groups in these places " +
    "must be avoided. Safe distancing measures must be observed at all times.\n\n" +
    "Members of public are also advised to return to their homes promptly and DO NOT LINGER.\n\n" +
    "If you do not comply with these rules, you will be fined an amount not exceeding $10,000, and/jailed for not " +
    "more than six months. If you violate these rules twice or more times, penalties will be doubled." 
  },

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  GROCERIES_MSG: "Here is a community-collated list of a possible online grocery shopping options in Singapore:\n\n" +
  "[ Fresh Produce ]\n" +
  "www.songfish.com.sg\n" +
  "www.tankfullyfresh.com\n" +
  "www.marketfresh.com.sg\n" +
  "www.purelyfresh.com.sg\n" +
  "www.apollomarine.com.sg\n" +
  "www.quanfaorganic.com.sg\n" +
  "www.organicdelivery.sg\n\n" +

  "[ Groceries ]\n" +
  "www.fairprice.com.sg\n" +
  "www.coldstorage.com.sg\n" +
  "www.shengsiong.com.sg\n" +
  "www.giant.sg\n" +
  "www.amazon.sg\n" +
  "www.redmart.lazada.sg\n" +
  "www.eamart.com\n" +
  "www.qoo10.sg\n" +
  "www.shopee.sg\n" +
  "www.opentaste.sg\n\n" +

  "[ Halal Groceries ]\n" +
  "www.mynikmart.sg\n" +
  "www.adamhalal.sg\n" +
  "www.csfoods.sg\n" +
  "www.haomart.com.sg\n\n" +

  "[ Premium / Specialized Groceries ]\n" +
  "www.ryansgrocery.com\n" +
  "www.thefarmersmarket.com.sg\n" +
  "www.sashasfinefoods.com\n" +
  "www.bestorganicfood.sg\n" +
  "www.thefishwives.com\n" +
  "www.hubers.com.sg\n" +
  "www.natures-glory.com\n" +
  "www.phdeli.sg\n" +
  "www.sgorganic.sg\n" +
  "www.littlefarms.com\n" +
  "www.greencircle.com.sg\n" +
  "www.yayapapaya.com.sg\n" +
  "www.sgdeliandgrocer.com.sg"
}