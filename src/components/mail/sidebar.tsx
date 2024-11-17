'use client'

import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import Nav from './nav'
import { File, Inbox, Send } from 'lucide-react'
import { api } from '~/trpc/react'

interface Props {
    isCollapsed: boolean
}
export default function Sidebar({ isCollapsed }: Props) {
    const [accountId] = useLocalStorage('accountId', '')

    const { data: inboxThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'inbox'
    })
    const { data: draftThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'draft'
    })
    const { data: sentThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'sent'
    })
    return (
        <div>
            <Nav
                isCollapsed={isCollapsed}
                links={[
                    {
                        title: "Inbox",
                        label: inboxThread?.toString() ?? '0',
                        icon: Inbox
                    },
                    {
                        title: "Draft",
                        label: draftThread?.toString() ?? '0',
                        icon: File
                    },
                    {
                        title: "Sent",
                        label: sentThread?.toString() ?? '0',
                        icon: Send
                    }
                ]}
            />
        </div>
    )
}
