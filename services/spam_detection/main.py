import os
import re
import pickle
from flask import Flask, request

app = Flask(__name__)

def clean_one_chat_msg_str(txt):
    chat_txt = txt

    # We normalize the URLs to become "httpaddr"
    chat_txt = re.sub(
      r"(http|ftp|https)?:?\/?\/?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?",
      "httpaddr", 
      chat_txt
    )

    # We replace all numbers with "numb"
    chat_txt = re.sub(
      r"\d",
      "numb",
      chat_txt
    )

    # We replace all dollar signs with "dollar"
    chat_txt = re.sub(
      r"\$",
      "dollar",
      chat_txt
    )

    # We remove all non-alphabetical characters
    chat_txt = re.sub(
      r"[^a-zA-Z ]+",
      "",
      chat_txt
    )

    # We remove all spaces, tabs, new lines, and multiple spaces, with a single whitespace character
    chat_txt = re.sub(
      r"[\n\s{2,}\t]+",
      " ",
      chat_txt
    )

    # And we strip away all trailing and leading whitespaces
    chat_txt = chat_txt.strip()
    
    return [chat_txt]

@app.route('/', methods=['POST'])
def predict_spam():
    # Ensure that the method is being triggered by a POST request
    if (request.method == 'POST'):
        # Read in the request headers
        content_type = request.headers['content-type']
        if (content_type == 'application/json'):
            req_json = request.get_json(silent=True)
            if (req_json and 'usr_msg' in req_json):
                txt = req_json['usr_msg']

                # Load the model
                model = pickle.load(open(os.environ.get('MODEL_PATH'), 'rb'))
                # Parse the text that we received
                parsed_txt = clean_one_chat_msg_str(txt)
                # Make the prediction
                prediction = model.predict(parsed_txt)[0]
                
                # Return the prediction to the user
                # Return 418 (I'm a teapot) if it is a spam message
                if (prediction == 1):
                    return ('', 418)
                # Else return 204 (OK, No Content) if it is ham
                else:
                    return ('', 204)

    # Else we abort this request
    else:
        return ('Invalid request.', 405)
