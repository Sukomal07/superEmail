'use server'

import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createStreamableValue } from "ai/rsc"

export async function generateEmail(context: string, prompt: string) {
    const stream = createStreamableValue('');

    (
        async () => {
            const { textStream } = await streamText({
                model: openai("gpt-4-turbo"),
                prompt: `
                    You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
            
                    THE TIME NOW IS ${new Date().toLocaleString()}
            
                    START CONTEXT BLOCK
                        ${context}
                    END OF CONTEXT BLOCK
            
                    USER PROMPT:
                        ${prompt}
            
                    When responding, please keep in mind:
                        - Be helpful, clever, and articulate. 
                        - Rely on the provided email context to inform your response.
                        - If the context does not contain enough information to fully address the prompt, politely give a draft response.
                        - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
                        - Do not invent or speculate about anything that is not directly supported by the email context.
                        - Keep your response focused and relevant to the user's prompt.
                        - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
                        - Directly output the email, no need to say 'Here is your email' or anything like that.
                        - No need to output subject
                `
            })

            for await (const token of textStream) {
                stream.update(token)
            }

            stream.done()
        }
    )()

    return { output: stream.value }

}

export async function generate(input: string, context: string) {
    const stream = createStreamableValue('');

    (
        async () => {
            const { textStream } = await streamText({
                model: openai('gpt-4-turbo'),
                prompt: `
                    ALWAYS RESPOND IN PLAIN TEXT, no HTML or no markdown or no Style.
                    You are a helpful AI embedded in an email client app that is used to autocomplete sentences, similar to the Google Gmail autocomplete feature.
                    Your traits include expert knowledge, helpfulness, cleverness, and articulateness.
                    You are a well-behaved, friendly, kind, and inspiring individual, eager to provide vivid and thoughtful responses to users.
                    The user is writing a piece of text in a text editor app. Help them complete their sentence according to the email context. 

                    Here’s the email context: ${context}
                    Here’s the text to complete: ${input}

                    When responding, please keep in mind:
                        - Do NOT repeat any words or phrases already written in the text editor. Focus on completing the sentence creatively and meaningfully.
                        - Keep the tone of the text consistent with the rest of the input.
                        - Ensure the response is short and sweet, and seamlessly completes the sentence.
                        - Do not generate an entire paragraph—only finish the sentence as needed.
                        - Avoid any fluff, such as "I’m here to help" or "I’m a helpful AI."
                        - Your output is directly concatenated to the input—do not add extra lines, HTML, or markdown or any style.

                    Remember: Only complete the sentence to match the tone and style, and keep it concise.
            `,
            });

            for await (const delta of textStream) {
                stream.update(delta);
            }

            stream.done();
        })();

    return { output: stream.value };
}