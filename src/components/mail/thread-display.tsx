import React from 'react'
import dynamic from 'next/dynamic'
import useThreads from '~/hooks/useThreads'
import { Button } from '../ui/button'
import { Archive, ArchiveX, Forward, Mail, Reply, ReplyAll, Trash } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { format } from 'date-fns'
import DisplayEmail from './display-email'
import ReplyBox from './reply-box'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { api } from '~/trpc/react'

const UserButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.UserButton), { ssr: false })

export default function ThreadDisplay() {
    const { threadId, threads, accountId, account } = useThreads()

    const { data: replyDetails } = api.account.getReplyDetails.useQuery({
        accountId,
        threadId: threadId ?? ""
    })

    const updateStatus = api.account.updateStatus.useMutation()

    const handleUpdateStatus = async () => {
        if (!threadId) return
        updateStatus.mutate({
            accountId,
            messageId: threadId,
            unread: true
        })
    }

    const thread = threads?.find(th => th.id === threadId)
    return (
        <div className='flex flex-col h-full'>
            <div className='flex items-center px-4 py-2'>
                <div className='flex items-center gap-2'>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!thread}>
                                <Archive className="size-4" />
                                <span className="sr-only">Archive</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                disabled={!thread}
                            >
                                <ArchiveX className='size-4' />
                                <span className='sr-only'>Move to junk</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to junk</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                disabled={!thread}
                            >
                                <Trash className='size-4' />
                                <span className="sr-only">Move to trash</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to trash</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                disabled={!thread}
                                onClick={handleUpdateStatus}
                            >
                                <Mail className='size-4' />
                                <span className="sr-only">Unread</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Unread</TooltipContent>
                    </Tooltip>
                </div>
                <div className='flex items-center ml-auto gap-2'>
                    <div className='flex items-center gap-2'>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!thread}>
                                    <Reply className="size-4" />
                                    <span className="sr-only">Reply</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reply</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!thread}>
                                    <ReplyAll className="size-4" />
                                    <span className="sr-only">Reply all</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reply all</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!thread}>
                                    <Forward className="size-4" />
                                    <span className="sr-only">Forward</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Forward</TooltipContent>
                        </Tooltip>
                    </div>
                    <UserButton />
                </div>
            </div>
            <Separator />
            {thread ? (
                <div className='flex flex-col flex-1 overflow-hidden'>
                    <div className='flex items-start p-4 justify-between'>
                        <div className=' flex flex-col gap-1 max-w-[33rem]'>
                            <h2 className='text-lg text-wrap font-semibold'>
                                {thread?.emails[0]?.subject}
                            </h2>
                            <div className='text-xs text-wrap'>
                                <span className='font-normal'>
                                    {
                                        replyDetails?.to.length && "Reply-to : "
                                    }
                                </span>
                                <span className='text-muted-foreground'>
                                    {
                                        replyDetails?.to
                                            .filter(to => to.address !== account?.emailAddress)
                                            .map(to => to.address)
                                    }
                                </span>
                            </div>
                        </div>

                        {thread?.emails[0]?.sentAt && (
                            <span className='ml-auto text-muted-foreground text-xs'>
                                {format(new Date(thread.emails[0].sentAt), 'PPpp')}
                            </span>
                        )}
                    </div>
                    <Separator />
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel minSize={2} defaultSize={60} className='!overflow-y-scroll !overflow-x-hidden'>
                            <div className='p-6 flex flex-col gap-3'>
                                {
                                    thread?.emails?.map((email) => (
                                        <DisplayEmail key={email.id} email={email} />
                                    ))
                                }
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel minSize={10} defaultSize={40}>
                            <ReplyBox />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            ) : (
                <span className='p-8 text-center text-muted-foreground'> No email selected </span>
            )}
        </div>
    )
}
