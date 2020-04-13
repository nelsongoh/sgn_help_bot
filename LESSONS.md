# Lessons and Concepts Learned

## Webhooks
So what exactly are webhooks? They're basically HTTP callbacks which are triggered by some event, and usually carry some data with it, say in the form of JSON objects. In our case for the Telegram bot, there are basically 2 options we could have used for the bot: 

Either through the use of a polling method, which requires one party to keep checking back in intervals to see if a new events exists, or, a webhook, where the waiting party is only activated when this webhook is triggered. You can imagine the polling method as person A checking with person B, to see if they have a new message for them, say every 5 minutes. The webhook method on the otherhand, is person B calling out to person A, once they have a new message.

How does this work with our Telegram bot? Basically we provide a URL to Telegram, letting them know the address for the webhook. So when Telegram receives an event, it knows which API URL to call, in order to inform us of something occurring. We then configure our server to listen for this particular URL, and then trigger whatever steps we need, based on the data we receive from Telegram.

## Promises
Promises are objects that allow us to perform asynchronous actions, which means that lines of code can continue running without having to wait for a certain line of code to be completed, before the lines of code after it can run. Let's take a look at an example to see what I mean here:

```javascript
// Let's use the example of axios, a promise-based HTTP client
// In this example, we try and run 3 simple HTTP GET calls to 3 different websites, and print out the HTTP status
// of the calls

let axios = require('axios');

// HTTP GET call #1
axios.get('www.google.com')
    .then((response) => {
        console.log(response.status);
    })
    .catch((err) => {
        console.log("Whoops! Something went wrong here!" + err);
    })

// HTTP GET call #2
axios.get('www.yahoo.com')
    .then((response) => {
        console.log(response.status);
    })
    .catch((err) => {
        console.log("Whoops! Something went wrong here!" + err);
    })

// HTTP GET call #3
axios.get('en.wikipedia.com')
    .then((response) => {
        console.log(response.status);
    })
    .catch((err) => {
        console.log("Whoops! Something went wrong here!" + err);
    })
```

Traditionally without promises, these HTTP GET calls would have been executed synchronously, meaning to say: Call #1 would have to make the call, get a response from the server, and then print out the response status, before call #2, and call #3 consecutively. Any block of code that came AFTER call #1, would have no choice but to wait until it was done.

However with promises, this no longer is the case. Calls #1, #2, and #3 can now run consecutively without having to wait for the server to return with a response to any of those calls. This is where the promise magic happens: A promise basically is a value that is not necessarily known at the time that the promise is created, but guarantees us that there will be some form of an outcome later on. This allows us to continue doing what needs to be done next, without having to wait unnecessarily for the value of the outcome to be known.

There are 3 possible states for a promise to be in:
1. *pending* - This basically means that the promise hasn't resolved yet
2. *fulfilled* - This means that the promise has been resolved, and the operations of that promise are successfully completed.
3. *rejected* - This means that the operations of the promise have failed, but the promise is nonetheless resolved.

In the event that we DO want some code to run only after the promise has been fulfilled, then we can make use of chained handlers, i.e. ```.then()```, and ```.catch()```. ```.then()``` and ```.catch()``` are functions that can have parameters (if we expect them, for example as per the case of axios, where we expect a response to be returned from the initial ```axios.get()``` call), which can be read in and fed to the next block of code that relies on the outcome of the promise. ```.catch()``` works similarly to ```.then()```, but is a handler that gets triggered should the promise become *rejected* (instead of being *fulfilled*). 
