"use client"

import React, { useEffect, useRef, useState } from 'react'
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor } from "@tiptap/react"
import Text from "@tiptap/extension-text"
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import EditorMenubar from './editor-menubar'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import TagInput from './input'
import AiCompossButton from './ai-composs-button'
import { generate } from './action'
import { readStreamableValue } from 'ai/rsc'
import useThreads from '~/hooks/useThreads'
import { turndown } from '~/lib/turndown'

interface ReplyEditorProps {
    toValues: { label: string, value: string }[];
    ccValues: { label: string, value: string }[];

    subject: string;
    setSubject: (subject: string) => void;
    to: string[]
    handleSend: (value: string) => void;
    isSending: boolean;

    onToChange: (values: { label: string, value: string }[]) => void;
    onCcChange: (values: { label: string, value: string }[]) => void;

    defaultToolbarExpand?: boolean;
    composeOpen?: boolean
}

export default function ReplyEditor({ toValues, ccValues, subject, setSubject, to, handleSend, isSending, onToChange, onCcChange, defaultToolbarExpand, composeOpen }: ReplyEditorProps) {
    const [value, setValue] = useState<string>('')
    const [expanded, setExpanded] = useState<boolean>(defaultToolbarExpand ?? false)
    const [generatedText, setGeneratedText] = useState('');
    const { threadId, threads } = useThreads()

    const thread = threads?.find(th => th.id === threadId)

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const aiGenerate = async (prompt: string) => {
        let fullText = '';
        let context: string | undefined = ''

        for (const email of thread?.emails ?? []) {
            const content = `
                    Subject: ${email.subject}
                    Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
                `

            context = content
        }
        const { output } = await generate(prompt, context)

        for await (const token of readStreamableValue(output)) {
            if (token) {
                fullText += token;
            }
        }

        setGeneratedText(fullText)
    }

    const CustomText = Text.extend({
        addKeyboardShortcuts() {
            return {
                'Mod-Alt-Space': () => {
                    if (this.editor.getText()) {
                        aiGenerate(this.editor.getText())
                    }
                    return true
                },
            }
        },
    })
    const editor = useEditor({
        autofocus: false,
        extensions: [StarterKit, CustomText, Underline, Image],
        immediatelyRender: false,
        editorProps: {
            attributes: {
                placeholder: "Write your reply here...",
                class: 'focus:outline-none flex-1 p-2 overflow-y-scroll'
            }
        },
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        }
    })

    useEffect(() => {
        editor?.commands.insertContent(generatedText)
    }, [generatedText, editor])

    const onGeneretae = (token: string) => {
        editor?.commands?.insertContent(token)
        if (scrollRef?.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    if (!editor) return <></>
    return (
        <div className='h-full flex flex-col justify-between relative'>
            <div className='flex py-2 border-b'>
                <EditorMenubar editor={editor} />
            </div>
            <div className='px-4 pt-2 pb-0 space-y-2'>
                <div className={`transition-all duration-300 ease-in-out ${expanded ? 'translate-y-0' : '-translate-y-[150%]'}`}>
                    {
                        expanded && (
                            <div className='flex flex-col gap-2 w-full'>
                                <TagInput
                                    label='To'
                                    onChange={onToChange}
                                    placeholder='Add Recipients'
                                    value={toValues}
                                    composeOpen={composeOpen}
                                />
                                <TagInput
                                    label='Cc'
                                    onChange={onCcChange}
                                    placeholder='Add Recipients'
                                    value={ccValues}
                                    composeOpen={composeOpen}
                                />
                                <Input
                                    id='subject'
                                    className='w-full focus-visible:ring-0'
                                    placeholder='Enter Subject'
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                />
                            </div>
                        )
                    }

                </div>

                <div className='flex items-center gap-2'>
                    <div className='cursor-pointer' onClick={() => setExpanded(!expanded)}>
                        <span className='font-medium text-green-600'>
                            Draft {" "}
                        </span>
                        <span className='text-wrap'>
                            to {to?.join(',')}
                        </span>
                    </div>
                    <AiCompossButton isComposing={defaultToolbarExpand} onGenerate={onGeneretae} />
                </div>

            </div>
            <div className='w-full px-4 h-full my-3'>
                <EditorContent ref={scrollRef} editor={editor} value={value} className={`border border-slate-400 rounded-sm ${composeOpen ? 'min-h-52' : 'min-h-full'} max-h-20 text-base flex flex-col`} />
            </div>
            <Separator />
            <div className="py-2 px-4 flex items-center justify-between sticky bottom-0 w-full bg-background z-10">
                <span className="text-sm text-muted-foreground">
                    Tip: Press{" "}
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                        Ctrl + Alt + Space
                    </kbd>{" "}
                    for AI autocomplete
                </span>

                <Button variant={"outline"}
                    onClick={async () => {
                        editor?.commands?.clearContent()
                        await handleSend(value)
                    }}
                    disabled={isSending || !to?.length || !subject}
                >
                    Send
                </Button>
            </div>
        </div>
    )
}
