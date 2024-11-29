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
const SearchBar = dynamic(() => import('./search-bar'), { ssr: false })

interface StyleProps {
    defaultLayout: number[] | undefined
    navCollapsedSize: number
    defaultCollapsed: boolean
}

export default function Mail({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapsed }: StyleProps) {

    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
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
                        <Sidebar isCollapsed={isCollapsed} />
                        <div className='flex-1'>
                        </div>
                        Ask AI
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
