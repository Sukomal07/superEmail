'use client'

import React, { useEffect } from 'react'
import { useChat } from 'ai/react'
import { AnimatePresence, motion } from "framer-motion"
import useThreads from '~/hooks/useThreads';
import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { ArrowUp, SparklesIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const transitionDebug = {
    type: "easeOut",
    duration: 0.2,
};

export default function AskAI({ isCollapsed }: { isCollapsed: boolean }) {
    const { accountId } = useThreads()
    const { input, handleInputChange, handleSubmit, messages } = useChat({
        api: "/api/chat",
        body: {
            accountId,
        },
        onError: (error) => {
            if (error.message.includes('Limit reached')) {
                toast.error('You have reached the limit for today. Please upgrade to pro to ask as many questions as you want')
            }
        },
        initialMessages: [],
    });
    useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);


    if (isCollapsed) return null;
    return (
        <div className='p-4 mb-14'>
            {/* <PremiumBanner /> */}
            {/* <div className="h-4"></div> */}
            <motion.div className="flex flex-col items-end justify-end border p-4 rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900">
                <div className="max-h-56 overflow-y-scroll w-full flex flex-col gap-2" id='message-container'>
                    <AnimatePresence mode="wait">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout="position"
                                className={cn("z-10 mt-2 max-w-[250px] break-words rounded-2xl bg-gray-200 dark:bg-gray-800", {
                                    'self-end text-gray-900 dark:text-gray-100': message.role === 'user',
                                    'self-start bg-blue-500 text-white': message.role === 'assistant',
                                })}
                                layoutId={`container-[${messages.length - 1}]`}
                                transition={transitionDebug}
                            >
                                <div className="px-3 py-2 text-[15px] leading-[15px]">
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                {messages.length > 0 && <div className="h-4"></div>}
                <div className="w-full">
                    {messages.length === 0 && (
                        <div className="mb-4 flex flex-col gap-2">

                            <div>
                                <p className='text-gray-900 dark:text-gray-100 flex gap-2 items-center'>
                                    Your personalised AI
                                    <SparklesIcon className='size-5 text-gray-500' />
                                </p>
                                <p className='text-gray-500 text-xs dark:text-gray-400'>Get answers to your questions about your emails</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span
                                    onClick={() => handleInputChange({
                                        target: {
                                            value: 'What can I ask?'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>)}
                                    className='px-2 py-1 cursor-pointer bg-gray-800 text-gray-200 rounded-md text-xs'
                                >
                                    What can I ask?
                                </span>
                                <span
                                    onClick={() => handleInputChange({
                                        target: {
                                            value: 'When is my next flight?'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>)}
                                    className='px-2 py-1 cursor-pointer bg-gray-800 text-gray-200 rounded-md text-xs'
                                >
                                    When is my next flight?
                                </span>
                                <span
                                    onClick={() => handleInputChange({
                                        target: {
                                            value: 'When is my next meeting?'
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>)}
                                    className='px-2 py-1 cursor-pointer bg-gray-800 text-gray-200 rounded-md text-xs'>
                                    When is my next meeting?
                                </span>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="w-full relative">
                        <Textarea
                            onChange={handleInputChange}
                            value={input}
                            placeholder="Ask AI anything about your emails"
                            className="resize-none"
                            rows={3}
                        />
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="rounded-lg absolute right-1 top-10"
                            disabled={!input}
                        >
                            <ArrowUp />
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
