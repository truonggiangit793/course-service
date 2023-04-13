import configs from "@root/env.config";
import { Configuration, OpenAIApi } from "openai";

const createCompletion = async function (message) {
    const temperature = Math.random() * 2;
    const configuration = new Configuration({ apiKey: configs.CHAT_GPT_API_KEY });
    const openai = new OpenAIApi(configuration);
    try {
        const completion = await openai.createChatCompletion({
            temperature,
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        return completion.data.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            console.log({ status: error.response.status, error: error.response.data });
            return "//Error: " + error.response.data.error.message;
        } else {
            console.log(error.message);
            return "//Error: " + error.message;
        }
    }
};

const openaiTest = async function (message) {
    const temperature = Math.random() * 2;
    const configuration = new Configuration({ apiKey: configs.CHAT_GPT_API_KEY });
    const openai = new OpenAIApi(configuration);
    try {
        const completion = await openai.createChatCompletion({
            temperature,
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        return completion.data.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            console.log({ status: error.response.status, error: error.response.data });
            return "//Error: " + error.response.data.error.message;
        } else {
            console.log(error.message);
            return error.message;
        }
    }
};

export default { createCompletion, openaiTest };
