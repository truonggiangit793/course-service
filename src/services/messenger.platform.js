import request from "request";
import configs from "@root/env.config";
import platformOpenAI from "@/services/platform.openai";

// Function to handle postback
const handlePostback = async function (sender_psid, receive_postback) {};

// Function to handle sender actions
const handleSenderAction = function (sender_psid, sender_action) {
    // Send the message to facebook api
    request(
        {
            uri: "https://graph.facebook.com/v16.0/" + configs.PAGE_ID + "/messages",
            qs: { access_token: configs.PAGE_ACCESS_TOKEN, sender_action, recipient: { id: sender_psid } },
            method: "POST",
        },
        function (err, res, body) {
            if (err) {
                // console.dir(err, { depth: null });
                console.log("Unable to send a sender action!");
            } else {
                console.log("Sent a sender action!");
            }
        }
    );
};

// Function to handle api calling
const callSendAPI = function (sender_psid, response) {
    // Construct the message body
    let request_body = { recipient: { id: sender_psid }, message: response };
    // Send the message to facebook api
    request(
        {
            uri: "https://graph.facebook.com/v16.0/me/messages",
            qs: { access_token: configs.PAGE_ACCESS_TOKEN },
            method: "POST",
            json: request_body,
        },
        function (err, res, body) {
            if (err) {
                console.log("Unable to send message!");
            } else {
                console.log("Message sent successfully!");
            }
        }
    );
};

// Function to handle message
const handleMessage = async function (sender_psid, receive_message) {
    // Check if the message contains text
    if (receive_message.text) {
        // Create the payload for a basic text message
        const response = await platformOpenAI.createCompletion(receive_message.text);
        // Send the sender action
        handleSenderAction(sender_psid, "typing_off");
        // Send the response message
        callSendAPI(sender_psid, { text: response });
    }
    // Check if the message contains attachments
    if (receive_message.attachments) {
        const response = { text: "How can I assist you today?" };
        // Send the sender action
        handleSenderAction(sender_psid, "typing_off");
        // Send the response message
        callSendAPI(sender_psid, response);
    }
};

export default { handleMessage, handlePostback, callSendAPI, handleSenderAction };
