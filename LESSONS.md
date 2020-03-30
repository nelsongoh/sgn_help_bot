# Lessons and Concepts Learned

## Webhooks
So what exactly are webhooks? They're basically HTTP callbacks which are triggered by some event, and usually carry some data with it, say in the form of JSON objects. In our case for the Telegram bot, there are basically 2 options we could have used for the bot: 

Either through the use of a polling method, which requires one party to keep checking back in intervals to see if a new events exists, or, a webhook, where the waiting party is only activated when this webhook is triggered. You can imagine the polling method as person A checking with person B, to see if they have a new message for them, say every 5 minutes. The webhook method on the otherhand, is person B calling out to person A, once they have a new message.

How does this work with our Telegram bot? Basically we provide a URL to Telegram, letting them know the address for the webhook. So when Telegram receives an event, it knows which API URL to call, in order to inform us of something occurring. We then configure our server to listen for this particular URL, and then trigger whatever steps we need, based on the data we receive from Telegram.

## Promises (TO BE CONTINUED)