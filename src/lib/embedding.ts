import { openai, type ResponseTypes } from "./openai"

export async function getEmbeddings(text: string) {
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text.replace(/\n/g, " ")
        })

        const result = (await response.json()) as ResponseTypes["createEmbedding"]

        return result.data[0]?.embedding
    } catch (error) {
        console.log("error calling openai embeddings api", error)
        throw error
    }
}