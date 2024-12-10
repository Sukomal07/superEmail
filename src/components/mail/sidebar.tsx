'use client'

import React from 'react'
import Nav from './nav'
import { File, Inbox, Send } from 'lucide-react'

interface Props {
    isCollapsed: boolean
    inboxThread: string
    draftThread: string
    sentThread: string
}
export default function Sidebar({ isCollapsed, inboxThread, draftThread, sentThread }: Props) {
    return (
        <div>
            <Nav
                isCollapsed={isCollapsed}
                links={[
                    {
                        title: "Inbox",
                        label: inboxThread ?? '0',
                        icon: Inbox
                    },
                    {
                        title: "Draft",
                        label: draftThread ?? '0',
                        icon: File
                    },
                    {
                        title: "Sent",
                        label: sentThread ?? '0',
                        icon: Send
                    }
                ]}
            />
        </div>
    )
}
