'use client'

import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { Letter } from 'react-letter'
import Avatar from 'react-avatar'
import useThreads from '~/hooks/useThreads'
import { cn } from '~/lib/utils'
import { type RouterOutputs } from '~/trpc/react'

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0]
}

export default function DisplayEmail({ email }: Props) {
    const { account } = useThreads()

    const isMe = account?.emailAddress === email.from.address
    return (
        <div
            className={cn('border rounded-md p-4 transition-all hover:translate-x-2', {
                'border-l-gray-800 border-l-4': isMe
            })}
        >
            <div className='flex items-center justify-between gap-2 mb-4'>
                <div className='flex items-center justify-between gap-2'>
                    {!isMe && <Avatar name={email.from.name ?? email.from.address} email={email.from.address} size='35' textSizeRatio={2} round={true} />}
                    <span className='font-medium'>
                        {isMe ? 'Me' : email.from.name ?? email.from.address}
                    </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(email.sentAt ?? new Date(), {
                        addSuffix: true
                    })}
                </p>
            </div>
            <Letter html={email?.body ?? ''} className='bg-white rounded-md text-black flex justify-center items-center' />
        </div>
    )
}