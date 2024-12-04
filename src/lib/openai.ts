import { Configuration, OpenAIApi, type ResponseTypes } from "openai-edge"

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

export {
    openai,
    type ResponseTypes
}