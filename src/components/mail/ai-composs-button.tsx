import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Bot } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { generateEmail } from './action'
import { readStreamableValue } from 'ai/rsc'
import useThreads from '~/hooks/useThreads'
import { turndown } from '~/lib/turndown'

interface Props {
    isComposing?: boolean
    onGenerate: (token: string) => void
}

export default function AiCompossButton({ isComposing, onGenerate }: Props) {
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState('')
    const { threadId, threads, account } = useThreads()

    const thread = threads?.find(th => th.id === threadId)


    const aiGenerate = async () => {
        let context: string | undefined = ''

        if (!isComposing) {
            for (const email of thread?.emails ?? []) {
                const content = `
                    Subject: ${email.subject}
                    From: ${email.from.name}
                    address: ${email.from.address}
                    Sent: ${email.sentAt.toLocaleString()}
                    Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
                `

                context = content
            }
        }

        context += `
            My name is ${account?.name} and my email is ${account?.emailAddress}
        `

        const { output } = await generateEmail(context, prompt)
        for await (const token of readStreamableValue(output)) {
            if (token) {
                onGenerate(token)
            }

        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} size={"icon"} onClick={() => setOpen(true)}>
                    <Bot />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Smart Compose</DialogTitle>
                    <DialogDescription>
                        Write your email using our AI. AI will compose an email based on the context of your previous emails.
                    </DialogDescription>
                    <div className='h-2'></div>
                    <Textarea
                        placeholder='What would you like to compose ?'
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className='max-h-96'
                    />
                    <div className='h-2'></div>
                    <Button
                        onClick={() => {
                            setOpen(false)
                            setPrompt('')
                            aiGenerate()
                        }}
                    >
                        Generate
                    </Button>

                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}
