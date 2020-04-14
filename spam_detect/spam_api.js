module.exports = {
  detectMessage: (msg) => {
    let axios = require('axios').default;
    return axios({
      method: "post",
      url: process.env.DETECT_SPAM_FUNC_URL, 
      data: { usr_msg: msg.toString() },
      "headers": {"Content-Type": "application/json"},
      validateStatus: ((status) => {
        return true;
      })
    })
    .then((resp) => {
      // If we get the "I'm a teapot" status, this is spam
      if (resp.status == 418) {
        return true
      }
      // Else if we get a "OK, no content" status, it's a ham message
      else if (resp.status == 204) {
        return false
      }
      // If we receive any other status message, we throw an error
      else {
        throw "We're getting a different status from the spam detection API: " + resp.status
      }
    });
  }
}