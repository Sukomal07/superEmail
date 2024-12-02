import { type AnyOrama, create, insert, search } from "@orama/orama"
import { persist, restore } from "@orama/plugin-data-persistence"
import { db } from "~/server/db"
import { getEmbeddings } from "./embedding"

export class OramaClient {
    // @ts-ignore
    private orama: AnyOrama
    private accountId: string

    constructor(accountId: string) {
        this.accountId = accountId
    }

    async saveIndex() {
        const index = await persist(this.orama, 'json')

        await db.account.update({
            where: {
                id: this.accountId
            },
            data: {
                oramaIndex: index as Buffer
            }
        })
    }

    async initialize() {
        const account = await db.account.findUnique({
            where: {
                id: this.accountId
            }
        })

        if (!account) {
            throw new Error("Account not found")
        }

        if (account.oramaIndex) {
            this.orama = await restore('json', account.oramaIndex as any)
        } else {
            this.orama = await create({
                schema: {
                    subject: 'string',
                    body: 'string',
                    rawBody: 'string',
                    from: 'string',
                    to: 'string[]',
                    sentAt: 'string',
                    threadId: 'string',
                    embeddings: 'vector[1536]'
                }
            })

            await this.saveIndex()
        }
    }

    async search({ term }: { term: string }) {
        return await search(this.orama, {
            term
        })
    }

    async vectorSearch({ term, numResults = 10 }: { term: string, numResults?: number }) {
        const embedding = await getEmbeddings(term)
        const results = await search(this.orama, {
            mode: 'hybrid',
            term: term,
            vector: {
                value: embedding,
                property: 'embeddings'
            },
            similarity: 0.80,
            limit: numResults
        })

        return results
    }

    async insert(document: any) {
        await insert(this.orama, document)
        await this.saveIndex()
    }
}