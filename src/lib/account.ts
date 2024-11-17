import axios from "axios"
import { type SyncUpdatedResponse, type SyncResponse, type EmailMessage } from "~/types/response";

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

    async getUpdatedEmails({ deltaToken, pageToken }: { deltaToken?: string, pageToken?: string }) {
        const params: Record<string, string> = {}
        if (deltaToken) {
            params.deltaToken = deltaToken
        }

        if (pageToken) {
            params.pageToken = pageToken
        }

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            params
        })

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

            console.log('Initial sync complete', allEmails.length, 'emails')

            return {
                emails: allEmails,
                deltaToken: storedeltaToken
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during sync:', JSON.stringify(error.response?.data, null, 2))
            } else {
                console.error('Error during sync', error)
            }
        }
    }
}