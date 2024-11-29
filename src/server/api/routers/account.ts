import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "~/server/db";
import { type Prisma } from "@prisma/client";
import { emailAddressSchema } from "~/types/response";
import { Account } from "~/lib/account";

export const authoriseAccountAccess = async (accounId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accounId,
            userId
        },
        select: {
            id: true,
            emailAddress: true,
            name: true,
            accessToken: true
        }
    })

    if (!account) {
        throw new Error('Account not found')
    }

    return account
}

const inboxFilter = (accountId: string): Prisma.ThreadWhereInput => ({
    accountId,
    inboxStatus: true
})

const sentFilter = (accountId: string): Prisma.ThreadWhereInput => ({
    accountId,
    sentStatus: true
})

const draftFilter = (accountId: string): Prisma.ThreadWhereInput => ({
    accountId,
    draftStatus: true
})

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ ctx }) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId
            },
            select: {
                id: true,
                emailAddress: true,
                name: true
            }
        })
    }),

    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        let filter: Prisma.ThreadWhereInput = {}

        if (input.tab === "inbox") {
            filter = inboxFilter(account.id)
        } else if (input.tab === "sent") {
            filter = sentFilter(account.id)
        } else if (input.tab === "draft") {
            filter = draftFilter(account.id)
        }

        return await ctx.db.thread.count({
            where: filter
        })
    }),

    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        const acc = new Account(account.accessToken)

        acc.syncEmails({ accountId: account.id })

        let filter: Prisma.ThreadWhereInput = {}
        if (input.tab === "inbox") {
            filter = inboxFilter(account.id)
        } else if (input.tab === "sent") {
            filter = sentFilter(account.id)
        } else if (input.tab === "draft") {
            filter = draftFilter(account.id)
        }

        filter.done = {
            equals: input.done
        }

        return await ctx.db.thread.findMany({
            where: filter,
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc'
                    },
                    select: {
                        from: true,
                        to: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true
                    }
                }
            },
            take: 15,
            orderBy: {
                lastMessageDate: 'desc'
            }
        })
    }),

    getSuggestions: privateProcedure.input(z.object({
        accountId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const emailAddress = await ctx.db.emailAddress.findMany({
            where: {
                accountId: account.id
            },
            select: {
                address: true,
                name: true
            }
        })
        return emailAddress
    }),

    getReplyDetails: privateProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId
            },
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'desc'
                    },
                    select: {
                        from: true,
                        to: true,
                        cc: true,
                        bcc: true,
                        sentAt: true,
                        subject: true,
                        internetMessageId: true
                    }
                }
            }
        })

        if (!thread || thread.emails.length === 0) {
            throw new Error("Thread not found")
        }

        const lastExternalMessage = thread.emails.reverse().find(email => email.from.id !== account.id)

        if (!lastExternalMessage) {
            throw new Error("No external message found")
        }

        return {
            subject: lastExternalMessage.subject,
            to: [lastExternalMessage.from, ...lastExternalMessage.to.filter(to => to.address !== account.emailAddress)],
            cc: lastExternalMessage.cc.filter(cc => cc.address !== account.emailAddress),
            from: { name: account.name, address: account.emailAddress },
            id: lastExternalMessage.internetMessageId

        }
    }),

    sendEmail: privateProcedure.input(z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        const acc = new Account(account.accessToken)

        await acc.sendEmail({
            from: input.from,
            subject: input.subject,
            body: input.body,
            inReplyTo: input.inReplyTo,
            to: input.to,
            bcc: input.bcc,
            cc: input.cc,
            replyTo: input.replyTo,
            threadId: input.threadId
        })
    }),

    sendReply: privateProcedure.input(z.object({
        accountId: z.string(),
        messageId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema
    })).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken)

        await acc.replyEmail({
            messageId: input.messageId,
            from: input.from,
            subject: input.subject,
            body: input.body,
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            replyTo: input.replyTo
        })
    }),

    updateStatus: privateProcedure.input(z.object({
        accountId: z.string(),
        messageId: z.string(),
        unread: z.boolean()
    })).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken)

        await acc.updateStatus({
            messageId: input.messageId,
            unread: input.unread
        })
    })
})