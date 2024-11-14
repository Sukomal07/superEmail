"use server"

import { auth } from "@clerk/nextjs/server"

export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office365') => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized , Please log in")
    }

    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID!,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
        responseType: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`
    })

    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
}

export const exchangeCodeForAccessToken = async (code: string) => {
    try {
        if (!code) {
            throw new Error("Code is required")
        }

        const { userId } = await auth()

        if (!userId) {
            throw new Error("Unauthorized")
        }

        const clientId = process.env.AURINKO_CLIENT_ID
        const clientSecret = process.env.AURINKO_CLIENT_SECRET

        const credentials = btoa(`${clientId}:${clientSecret}`);

        const response = await fetch(`https://api.aurinko.io/v1/auth/token/${code}`, {
            method: "POST",
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json();

        return data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string

        }
    } catch (error: any) {
        console.log(error)

        throw new Error(error?.message)
    }
}

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await fetch('https://api.aurinko.io/v1/account', {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        return data as {
            email: string,
            name: string
        }
    } catch (error: any) {
        console.log(error)
        throw new Error(error?.message)
    }
}