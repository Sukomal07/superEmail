import { NextResponse, type NextRequest } from "next/server";
import { Account } from "~/lib/account";
import { syncEmailsToDatabase } from "~/lib/sync-to-db";
import { db } from "~/server/db";

export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json()

    if (!accountId || !userId) {
        return NextResponse.json({ error: 'Missing accountId or userId' }, { status: 400 })
    }

    const dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId
        }
    })

    if (!dbAccount) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const account = new Account(dbAccount.accessToken)

    const response = await account.performInitialSync()
    if (!response) {
        return NextResponse.json({ error: 'Failed to perform initial sync' }, { status: 500 })
    }

    const { emails, deltaToken } = response

    await db.account.update({
        where: {
            id: accountId,
            userId
        },
        data: {
            nextDeltaToken: deltaToken
        }
    })

    await syncEmailsToDatabase(emails, accountId)

    return NextResponse.json({ success: true }, { status: 200 })
}