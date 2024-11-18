import React from 'react'
import useThreads from '~/hooks/useThreads'
import { Button } from '../ui/button'
import { Archive, ArchiveX, Clock, Forward, Mail, MessageSquareOff, MoreVertical, Reply, ReplyAll, Star, Tag, Trash } from 'lucide-react'
import { Separator } from '../ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { format } from 'date-fns'
import DisplayEmail from './display-email'

export default function ThreadDisplay() {
    const { threadId, threads } = useThreads()

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
                </div>
                <Separator orientation='vertical' className='mx-2 h-6' />
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    disabled={!thread}
                >
                    <Clock className='size-4' />
                </Button>
                <div className='flex items-center ml-auto'>
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
                    <Separator orientation='vertical' className='mx-2 h-6' />
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant={"ghost"}
                                        size={"icon"}
                                        disabled={!thread}
                                    >
                                        <MoreVertical className='size-4' />
                                        <span className="sr-only">More</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>More</TooltipContent>
                            </Tooltip>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem>
                                <Mail /> Mark as unread
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Star /> Star thread
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Tag /> Add label
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MessageSquareOff /> Mute thread
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Separator />
            <div className='flex flex-col flex-1 overflow-hidden'>
                <div className='flex items-center p-4'>

                    <div className=' flex flex-col gap-1 items-start'>
                        <h2 className='text-lg text-wrap font-semibold'>
                            {thread?.emails[0]?.subject}
                        </h2>
                        <div className='text-xs text-wrap'>
                            <span className='font-normal'>
                                Reply-to : {" "}
                            </span>
                            <span className='text-muted-foreground'>
                                {thread?.emails[0]?.from?.address}
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
                <div className='max-h-[35rem] max-w-full overflow-y-scroll flex flex-col'>
                    <div className='p-6 flex flex-col gap-4'>
                        {
                            thread?.emails?.map((email) => (
                                <DisplayEmail key={email.id} email={email} />
                            ))
                        }
                    </div>
                </div>
                <div className='flex-1'></div>
                <Separator className='mt-auto' />
                Reply box
            </div>
        </div>
    )
}