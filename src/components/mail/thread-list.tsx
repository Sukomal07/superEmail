'use client'

import React from 'react'
import useThreads from '~/hooks/useThreads'
import { format, formatDistanceToNow } from 'date-fns'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'
import dompurify from "dompurify"
import { Badge } from '../ui/badge'

export default function ThreadList() {
    const { threads, threadId, setThreadId } = useThreads()

    const groupThreadsByDate = threads?.reduce((acc, thread) => {

        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'EEE dd MMM yyyy')

        if (!acc[date]) {
            acc[date] = []
        }

        acc[date].push(thread)

        return acc
    }, {} as Record<string, typeof threads>)
    return (
        <div className='max-w-full overflow-y-scroll max-h-[calc(100vh-120px)]'>
            {!threads || threads.length === 0 ? (
                <div className='flex justify-center items-center h-full text-muted-foreground'>
                    <span>No threads found</span>
                </div>
            ) : (
                <div className='flex flex-col gap-2 p-4 pt-0'>
                    {Object.entries(groupThreadsByDate ?? {}).map(([date, threads]) => {
                        return <React.Fragment key={date}>
                            <span className='text-xs font-semibold text-muted-foreground mt-5 first:mt-0'>
                                {date}
                            </span>
                            {threads.map((thread) => (
                                <Button
                                    key={thread.id}
                                    variant={`${thread.id === threadId ? "default" : "outline"}`}
                                    className={`h-full flex flex-col items-start gap-2 text-left`}
                                    onClick={() => setThreadId(thread.id)}
                                >
                                    <div className='flex flex-col w-full gap-1'>
                                        <div className='flex items-center py-1'>
                                            <div className='flex items-center gap-2'>
                                                <h1 className='font-semibold'>
                                                    {thread.emails.at(-1)?.from.name ?? thread.emails.at(-1)?.from.address}
                                                </h1>
                                            </div>
                                            <span className={cn("ml-auto text-xs")}>
                                                {formatDistanceToNow(thread.emails.at(-1)?.sentAt ?? new Date(), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <h1 className='text-sm font-medium truncate'>{thread.subject}</h1>
                                    </div>
                                    <p className='text-xs line-clamp-2 text-muted-foreground text-wrap'
                                        dangerouslySetInnerHTML={{
                                            __html: dompurify.sanitize(thread.emails.at(-1)?.bodySnippet ?? "",
                                                {
                                                    USE_PROFILES: { html: true }
                                                })
                                        }}
                                    >

                                    </p>
                                    {thread.emails[0]?.sysLabels.length && (
                                        <div className='flex items-center gap-2'>
                                            {thread.emails[0].sysLabels.map((label) => (
                                                <Badge
                                                    key={label}
                                                    variant={getBadgeVariantFromLabel(label)}
                                                    className='capitalize'
                                                >
                                                    {label}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </Button>
                            ))}
                        </React.Fragment>
                    })}
                </div>
            )}
        </div>
    )
}

function getBadgeVariantFromLabel(
    label: string
): React.ComponentProps<typeof Badge>["variant"] {
    if (["work"].includes(label.toLowerCase())) {
        return "default";
    }

    if (["personal"].includes(label.toLowerCase())) {
        return "outline";
    }

    return "secondary";
}
