"use client"

import React, { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { TooltipProvider } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import AccountSwitcher from './account-switcher'
import Sidebar from './sidebar'
import ThreadList from './thread-list'
import ThreadDisplay from './thread-display'
import dynamic from 'next/dynamic'
import AskAI from './ask-ai'
import { api } from '~/trpc/react'
import useThreads from '~/hooks/useThreads'
import { useLocalStorage } from 'usehooks-ts'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
const SearchBar = dynamic(() => import('./search-bar'), { ssr: false })

interface StyleProps {
    defaultLayout: number[] | undefined
    navCollapsedSize: number
    defaultCollapsed: boolean
}

export default function Mail({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapsed }: StyleProps) {

    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const [tab] = useLocalStorage<'inbox' | 'draft' | 'sent'>('tab', 'inbox');

    const { accountId, skip, setSkip, isFetching } = useThreads();

    const { data: inboxThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'inbox'
    }, { enabled: !!accountId, placeholderData: e => e, refetchInterval: 3000 })

    const { data: draftThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'draft'
    }, { enabled: !!accountId, placeholderData: e => e, refetchInterval: 3000 })

    const { data: sentThread } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'sent'
    }, { enabled: !!accountId, placeholderData: e => e, refetchInterval: 3000 })

    const totalThreads = {
        inbox: inboxThread ?? 0,
        draft: draftThread ?? 0,
        sent: sentThread ?? 0
    };

    const getTotalCount = () => totalThreads[tab];

    const handlePrevPage = () => {
        if (skip > 0) {
            setSkip(skip - 50);
        }
    };

    const handleNextPage = () => {
        if (skip + 50 < getTotalCount()) {
            setSkip(skip + 50);
        }
    };

    const isFirstPage = skip === 0;
    const isLastPage = skip + 50 >= getTotalCount();
    const startRange = skip + 1;
    const endRange = Math.min(skip + 50, getTotalCount());

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction='horizontal'
                className='min-h-screen h-full items-stretch'
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={12}
                    maxSize={20}
                    onCollapse={() => {
                        setIsCollapsed(true)
                    }}
                    onResize={() => {
                        setIsCollapsed(false)
                    }}
                    className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
                >
                    <div className='flex-1 flex flex-col h-full'>
                        <div className={cn('flex h-[52px] px-2 items-center justify-between')}>
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>
                        <Separator />
                        <Sidebar
                            isCollapsed={isCollapsed}
                            inboxThread={inboxThread?.toString() ?? '0'}
                            draftThread={draftThread?.toString() ?? '0'}
                            sentThread={sentThread?.toString() ?? '0'}
                        />
                        <div className='flex-1'>
                        </div>
                        <AskAI isCollapsed={isCollapsed} />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue='inbox'>
                        <div className='flex items-center px-4 py-2'>
                            <h1 className='text-xl font-semibold'>Inbox</h1>
                            <TabsList className='ml-auto'>
                                <TabsTrigger value='inbox' className='text-zinc-600 dark:text-zinc-200'>
                                    Inbox
                                </TabsTrigger>
                                <TabsTrigger value='done' className='text-zinc-600 dark:text-zinc-200'>
                                    Done
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator />
                        <SearchBar />
                        <div className='px-4 flex items-center gap-2 justify-end'>
                            <span className="text-xs text-muted-foreground">
                                {startRange} - {endRange} of {getTotalCount()}
                            </span>
                            <div className='flex gap-4 items-center'>
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    className='rounded-full'
                                    onClick={handlePrevPage}
                                    disabled={isFirstPage || isFetching}
                                >
                                    <ChevronLeft className='text-muted-foreground' />
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    className='rounded-full'
                                    onClick={handleNextPage}
                                    disabled={isLastPage || isFetching}
                                >
                                    <ChevronRight className='text-muted-foreground' />
                                </Button>
                            </div>
                        </div>
                        <TabsContent value='inbox'>
                            <ThreadList />
                        </TabsContent>
                        <TabsContent value='done'>
                            <ThreadList />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
                    <ThreadDisplay />
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}
