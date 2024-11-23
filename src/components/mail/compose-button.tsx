'use client'

import React, { useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { Button } from '../ui/button'
import { Pencil, X } from 'lucide-react'
import ReplyEditor from './reply-editor'
import useThreads from '~/hooks/useThreads'
import { useLocalStorage } from 'usehooks-ts'
import { api } from '~/trpc/react'

export default function ComposeButton() {
    const [open, setOpen] = useState(false)
    const [accountId] = useLocalStorage('accountId', '')
    const [toValues, setToValues] = useState<{ label: string; value: string; }[]>([])
    const [ccValues, setCcValues] = useState<{ label: string; value: string; }[]>([])
    const [subject, setSubject] = useState<string>('')


    const handleSend = async (value: string) => {
        console.log(value)
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
