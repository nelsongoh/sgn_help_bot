Last updated: 11th April 2020

# SGN Help Bot

## What is this bot about? Yet another Telegram bot? (Backstory and intro)
In light of the recent COVID-19 pandemic, thousand of Singaporeans abroad have been, and are still seeking, avenues of help to either try and return back home, or find local Singaporean communities in their respective countries for support. During this time, I'm one of these thousands of Singaporeans abroad, currently pursuing my Masters in Sydney, Australia. As part of the Ministry of Foreign Affairs' outreach to us in an email, we were provided with a Telegram group chat support link to support us during this time which is proudly managed by the Singapore Global Network (SGN).

The SGN (https://www.singaporeglobalnetwork.com/) is a Singapore government organization that has quickly put together resources to help support these fellow Singaporeans, both within and outside of the country, by helping to plan and orchestrate part of the Singapore COVID-19 response effort. During this time, there were officials from SGN helping to answer queries, liaise with the authorities, and one large problem, was the need for repeated answers to questions raised by newer members of the group. Hence, I decided to volunteer my time to mitigate some of these problems via a Telegram bot.

This bot was hacked together as quickly as I could have (which explains the horrible project structure), based on whatever time I had to help support the SGN Telegram group chats, by providing readily-available information in the form of quick links, to thousands of Singaporean group chat members.

Look here to see what [concepts I've learnt](https://github.com/nelsongoh/sgn_help_bot/blob/master/LESSONS.md) from this development experience!

## What is this bot made with? Where is it hosted?
This bot was created with simple Javascript, using a wrapper library (node-telegram-bot-api) and hosted on Google Cloud.
This bot also utilizes Google Cloud Firestore as a NoSQL database to read and write information about group chats in it.

## What are the features come with the bot?
- [x] Self-help commands for people to look up links to various resources
- [x] Self-help command to retrieve the latest COVID-19 cases (selecting from either Australia or Singapore at the moment)
- [x] Automated data fetching and parsing from government sites for updated COVID-19 cases (Australia and Singapore)
- [x] "Pull" feature to manually update the data for supported COVID-19 cases
- [x] Automated announcements at fixed frequencies regarding COVID-19 cases for selected group chats
- [x] Machine learning-based spam filter and automatic member and message removal
- [x] ~~Keyword-based spam filter and automatic member removal for unsolicited marketing scams / messages~~ (Deprecated)
- [x] Group chat registration via an admin-based "/command" into the datastore
- [x] Group chat message updates via an admin-based "/command" for automatic (requires cron set-up) bot announcements
- [x] Automated message forwarding from official channels to group chats
