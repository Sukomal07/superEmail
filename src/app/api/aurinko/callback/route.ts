import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { exchangeCodeForAccessToken, getAccountDetails } from "~/lib/aurinko"
import { waitUntil } from "@vercel/functions"
import { db } from "~/server/db"
import axios from "axios"

export const GET = async (req: NextRequest) => {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const params = req.nextUrl.searchParams

    const status = params.get('status')

    if (status !== 'success') {
        return NextResponse.json({ message: 'Failed to link account' }, { status: 400 })
    }

    const code = params.get('code')

    if (!code) {
        return NextResponse.json({ message: "No code provide" }, { status: 400 })
    }

    const token = await exchangeCodeForAccessToken(code)

    if (!token) {
        return NextResponse.json({ message: "Failed to exchange code for access token " }, { status: 400 })
    }

    const accountDetails = await getAccountDetails(token.accessToken)

    await db.account.upsert({
        where: {
            emailAddress: accountDetails.email
        },
        update: {
            id: token.accountId?.toString(),
            accessToken: token.accessToken
        },
        create: {
            id: token.accountId.toString(),
            userId: userId,
            emailAddress: accountDetails.email,
            name: accountDetails.name,
            accessToken: token.accessToken
        }
    })

    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId: userId
        }).then(response => {
            console.log('Initial sync trigger', response.data)
        }).catch(error => {
            console.error('Failed to trigger initial sync', error)
        })
    )

    return NextResponse.redirect(new URL('/mail', req.url))
}