import { type EmailAttachment, type EmailAddress, type EmailMessage } from "~/types/response";
import pLimit from "p-limit"
import { db } from "~/server/db";
import { Prisma } from "@prisma/client";
import { OramaClient } from "./orama";
import { turndown } from "./turndown";
import { getEmbeddings } from "./embedding";

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: {
                accountId_address: {
                    accountId: accountId,
                    address: address.address ?? ""
                }
            }
        })

        if (existingAddress) {
            const updateAddress = await db.emailAddress.update({
                where: {
                    id: existingAddress.id
                },
                data: {
                    name: address.name,
                    raw: address.raw
                }
            })

            return updateAddress
        } else {
            const newAddress = await db.emailAddress.create({
                data: {
                    address: address.address ?? "",
                    name: address.name,
                    raw: address.raw,
                    accountId: accountId
                }
            })
            return newAddress
        }
    } catch (error) {
        console.error("Failed to upsert email address", error)
        return null
    }
}

async function upsertAttachments(emailId: string, attachment: EmailAttachment) {
    try {
        await db.emailAttachment.upsert({
            where: {
                id: attachment.id ?? ""
            },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation
            },
            create: {
                id: attachment.id,
                emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            }
        })
    } catch (error) {
        console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log(`Upserting email ${index + 1}`);
    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox'

        if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
            emailLabelType = 'inbox'
        } else if (email.sysLabels.includes('sent')) {
            emailLabelType = 'sent'
        } else if (email.sysLabels.includes('draft')) {
            emailLabelType = 'draft'
        }

        const addressesToUpsert = new Map()

        for (const address of [email.from, ...email.to, ...email.replyTo, ...email.cc, ...email.bcc]) {
            addressesToUpsert.set(address.address, address)
        }

        const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = []

        for (const address of addressesToUpsert.values()) {
            const upsertedAddress = await upsertEmailAddress(address, accountId)
            upsertedAddresses.push(upsertedAddress)
        }

        const addressMap = new Map(
            upsertedAddresses.filter(Boolean).map(address => [address?.address, address])
        )

        const fromAddress = addressMap.get(email.from.address)
        if (!fromAddress) {
            console.log(`Failed to upsert from address for email ${email.bodySnippet}`)
            return;
        }

        const toAddresses = email.to.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const ccAddresses = email.cc.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const bccAddresses = email.bcc.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const replyToAddresses = email.replyTo.map(addr => addressMap.get(addr.address)).filter(Boolean)

        const thread = await db.thread.upsert({
            where: {
                id: email.threadId
            },
            update: {
                subject: email.subject,
                accountId: accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [
                    ...new Set([
                        fromAddress.id,
                        ...toAddresses.map(a => a!.id),
                        ...ccAddresses.map(a => a!.id),
                        ...bccAddresses.map(a => a!.id)
                    ])
                ]
            },
            create: {
                id: email.threadId,
                subject: email.subject,
                lastMessageDate: new Date(email.sentAt),
                accountId: accountId,
                done: false,
                draftStatus: emailLabelType === "draft",
                inboxStatus: emailLabelType === "inbox",
                sentStatus: emailLabelType === "sent",
                participantIds: [
                    ...new Set([
                        fromAddress.id,
                        ...toAddresses.map(a => a!.id),
                        ...ccAddresses.map(a => a!.id),
                        ...bccAddresses.map(a => a!.id)
                    ])
                ]
            }
        })

        await db.email.upsert({
            where: {
                id: email.id
            },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { set: toAddresses.map(a => ({ id: a?.id })) },
                cc: { set: ccAddresses.map(a => ({ id: a?.id })) },
                bcc: { set: bccAddresses.map(a => ({ id: a?.id })) },
                replyTo: { set: replyToAddresses.map(a => ({ id: a?.id })) },
                hasAttachments: email.hasAttachments,
                internetHeaders: email.internetHeaders as any,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: emailLabelType,
            },
            create: {
                id: email.id,
                emailLabel: emailLabelType,
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders as any,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { connect: toAddresses.map(a => ({ id: a?.id })) },
                cc: { connect: ccAddresses.map(a => ({ id: a?.id })) },
                bcc: { connect: bccAddresses.map(a => ({ id: a?.id })) },
                replyTo: { connect: replyToAddresses.map(a => ({ id: a?.id })) },
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
            }
        });

        const threadEmails = await db.email.findMany({
            where: {
                threadId: thread.id
            },
            orderBy: {
                receivedAt: 'asc'
            }
        })

        let threadFolderType = 'sent'

        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox'
                break;
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft'
            }
        }

        await db.thread.update({
            where: {
                id: thread.id
            },
            data: {
                draftStatus: threadFolderType === 'draft',
                inboxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent'
            }
        })

        for (const attachment of email.attachments) {
            await upsertAttachments(email.id, attachment)
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(`Prisma error for email ${email.id}: ${error.message}`);
        } else {
            console.log(`Unknown error for email ${email.id}: ${error}`);
        }
    }


}

export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log(`Syncing ${emails.length} emails to database`);
    const limit = pLimit(10)

    const orama = new OramaClient(accountId)
    await orama.initialize()

    try {
        const tasks = emails.map((email, index) =>
            limit(async () => {
                await upsertEmail(email, accountId, index);
                const body = turndown.turndown(email.body ?? email.bodySnippet ?? "")
                const payload = `From: ${email.from.name} <${email.from.address}>\nTo: ${email.to.map(t => `${t.name} <${t.address}>`).join(', ')}\nSubject: ${email.subject}\nBody: ${body}\n SentAt: ${new Date(email.sentAt).toLocaleString()}`
                const bodyEmbedding = await getEmbeddings(payload);

                await orama.insert({
                    subject: email.subject,
                    body: body,
                    rawBody: email.bodySnippet ?? '',
                    from: `${email.from.name} <${email.from.address}>`,
                    to: email.to.map(t => `${t.name} <${t.address}>`),
                    sentAt: new Date(email.sentAt).toLocaleString(),
                    embeddings: bodyEmbedding,
                    threadId: email.threadId
                })
            })
        );

        await Promise.all(tasks);

        console.log("All emails synced successfully");

    } catch (error) {
        console.error("Failed to sync emails to database", error)
    }
}