import axios from "axios"
import { db } from "~/server/db";
import { type SyncUpdatedResponse, type SyncResponse, type EmailMessage, type EmailAddress } from "~/types/response";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token
    }

    private async startSync() {
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            params: {
                daysWithin: 7,
                bodyType: "html"
            }
        })

        return response.data
    }

    async getUpdatedEmails({ deltaToken, pageToken }: { deltaToken?: string, pageToken?: string }): Promise<SyncUpdatedResponse> {
        const params: Record<string, string> = {}
        if (deltaToken) {
            params.deltaToken = deltaToken
        }

        if (pageToken) {
            params.pageToken = pageToken
        }

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            params,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        })

        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        return response.data
    }

    async performInitialSync() {
        try {
            let syncResponse = await this.startSync()

            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 2000))
                syncResponse = await this.startSync()
            }

            let storedeltaToken: string = syncResponse.syncUpdatedToken

            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedeltaToken })

            if (updatedResponse.nextDeltaToken) {
                storedeltaToken = updatedResponse.nextDeltaToken
            }

            let allEmails: EmailMessage[] = updatedResponse.records

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken })
                allEmails = allEmails.concat(updatedResponse.records)
                if (updatedResponse.nextDeltaToken) {
                    storedeltaToken = updatedResponse.nextDeltaToken
                }
            }

            return {
                emails: allEmails,
                deltaToken: storedeltaToken
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during sync:', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error during sync', error)
            }
        }
    }

    async syncEmails({ accountId }: { accountId: string }) {
        try {
            const account = await db.account.findUnique({
                where: {
                    id: accountId,
                    accessToken: this.token
                }
            })

            if (!account) throw new Error("Invalid token")

            if (!account?.nextDeltaToken) {
                throw new Error('Account not ready for sync')
            }

            let response = await this.getUpdatedEmails({
                deltaToken: account.nextDeltaToken
            })

            let storedeltaToken = account.nextDeltaToken

            let allEmails: EmailMessage[] = response.records

            if (response.nextDeltaToken) {
                storedeltaToken = response.nextDeltaToken
            }

            while (response.nextPageToken) {
                response = await this.getUpdatedEmails({
                    pageToken: response.nextPageToken
                })
                allEmails = allEmails.concat(response.records)
                if (response.nextDeltaToken) {
                    storedeltaToken = response.nextDeltaToken
                }
            }

            if (!response) throw new Error("Failed to sync emails")

            try {
                await syncEmailsToDatabase(allEmails, account.id)
            } catch (error) {
                console.error("Error during sync to database", error)
            }

            await db.account.update({
                where: {
                    id: account.id
                },
                data: {
                    nextDeltaToken: storedeltaToken
                }
            })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error during sync emails", error)
            } else {
                console.error('Error during Fetch:', error)
            }
        }
    }

    async sendEmail({ from, subject, inReplyTo, body, references, threadId, to, cc, bcc, replyTo }: {
        from: EmailAddress, subject: String, inReplyTo?: string, body: string, references?: string, threadId?: string, to: EmailAddress[], cc?: EmailAddress[], bcc?: EmailAddress[],
        replyTo?: EmailAddress
    }) {
        try {
            const response = await axios.post('https://api.aurinko.io/v1/email/messages', {
                from,
                subject,
                inReplyTo,
                body,
                references,
                threadId,
                to,
                cc,
                bcc,
                replyTo: [replyTo]
            }, {
                params: {
                    returnIds: true
                },
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            })

            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(error.message)
            } else {
                console.error('Error during email send', error)
            }
        }
    }
}