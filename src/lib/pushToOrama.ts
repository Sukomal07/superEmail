"use server"

import { OramaClient } from "./orama";
import { turndown } from "./turndown";
import { getEmbeddings } from "./embedding";

export async function pushToOrama(threads: any[], accountId: string) {
    try {
        const orama = new OramaClient(accountId);
        await orama.initialize();

        for (const thread of threads) {
            for (const email of thread.emails) {
                // Check if the email is already indexed by threadId
                const searchResult = await orama.search({ term: email.id });
                const isIndexed = searchResult.hits.some(hit => hit.document.threadId === email.id);

                if (!isIndexed) {
                    const body = turndown.turndown(email.body ?? email.bodySnippet ?? "");
                    const payload = `From: ${email.from.name} <${email.from.address}>\n` +
                        `To: ${email.to.map((t: any) => `${t.name} <${t.address}>`).join(', ')}\n` +
                        `Subject: ${email.subject}\n` +
                        `Body: ${body}\n` +
                        `SentAt: ${new Date(email.sentAt).toLocaleString()}`;

                    const bodyEmbedding = await getEmbeddings(payload);

                    await orama.insert({
                        subject: email.subject,
                        body: body,
                        rawBody: email.bodySnippet ?? "",
                        from: `${email.from.name} <${email.from.address}>`,
                        to: email.to.map((to: any) => `${to.name} <${to.address}>`),
                        sentAt: new Date(email.sentAt).toLocaleString(),
                        threadId: email.id,
                        embeddings: bodyEmbedding,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error pushing to Orama:", error);
    }
}
