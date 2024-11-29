'use client'

import React, { useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { Button } from '../ui/button'
import { Pencil, X } from 'lucide-react'
import ReplyEditor from './reply-editor'
import useThreads from '~/hooks/useThreads'
import { api } from '~/trpc/react'
import { toast } from 'sonner'

export default function ComposeButton() {
    const [open, setOpen] = useState<boolean>(false)
    const [subject, setSubject] = useState<string>('')
    const [toValues, setToValues] = useState<{ label: string; value: string; }[]>([])
    const [ccValues, setCcValues] = useState<{ label: string; value: string; }[]>([])
    const { account } = useThreads()



    const sendEmail = api.account.sendEmail.useMutation()

    const handleSend = async (value: string) => {

        if (!account) return


        sendEmail.mutate({
            accountId: account?.id ?? "",
            from: { address: account.emailAddress, name: account.name },
            body: value,
            subject,
            to: toValues.map(to => ({ name: to.value, address: to.value })),
            cc: ccValues.map(cc => ({ name: cc.value, address: cc.value })),
            replyTo: { name: account.name, address: account.emailAddress }

        }, {
            onSuccess: () => {
                toast.success('Email sent')
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button>
                    <Pencil />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className='flex justify-between items-center'>
                    <DrawerTitle>Compose Email</DrawerTitle>
                    <DrawerClose asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <X />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>
                <ReplyEditor
                    toValues={toValues}
                    ccValues={ccValues}

                    onToChange={(values) => {
                        setToValues(values)
                    }}
                    onCcChange={(values) => {
                        setCcValues(values)
                    }}

                    subject={subject}
                    setSubject={setSubject}

                    to={toValues.map(to => to.value)}

                    handleSend={handleSend}
                    isSending={false}
                    composeOpen={true}
                    defaultToolbarExpand={true}
                />
            </DrawerContent>
        </Drawer>

    )
}
