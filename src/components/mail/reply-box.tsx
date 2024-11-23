'use client';

import React, { useEffect, useState } from 'react'
import ReplyEditor from './reply-editor';
import { api, type RouterOutputs } from '~/trpc/react';
import useThreads from '~/hooks/useThreads';

export default function ReplyBox() {
    const { accountId, threadId } = useThreads()
    const { data: replyDetails } = api.account.getReplyDetails.useQuery({
        accountId,
        threadId: threadId ?? ""
    })

    if (!replyDetails) {
        return (
            <div className='w-full h-full flex justify-center items-center'>
                <span className='text-sm text-muted-foreground text-center'>
                    Select a mail to reply
                </span>
            </div>
        )
    }
    return (
        <Editor replyDetails={replyDetails} />
    )
}

function Editor({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] }) {

    const { threadId } = useThreads()
    const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
    const [toValues, setToValues] = useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })) || [])
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address ?? cc.name, value: cc.address })) || [])

    useEffect(() => {
        if (!threadId || !replyDetails) return

        if (!replyDetails.subject.startsWith("Re")) {
            setSubject(`Re: ${replyDetails.subject}`)
        }

        setToValues(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })))
        setCcValues(replyDetails.cc.map(cc => ({ label: cc.address ?? cc.name, value: cc.address })))
    }, [threadId, replyDetails])

    const handleSend = async (value: string) => {
        console.log(value)
    }
    return (
        <ReplyEditor
            subject={subject}
            setSubject={setSubject}
            toValues={toValues}
            ccValues={ccValues}
            onToChange={setToValues}
            onCcChange={setCcValues}
            to={replyDetails.to.map(to => to.address)}
            handleSend={handleSend}
            isSending={false}
        />
    )
}
