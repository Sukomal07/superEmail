import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { isSearchingAtom, searchValueAtom } from './search-bar'
import { api } from '~/trpc/react'
import { useDebounceValue } from 'usehooks-ts'
import useThreads from '~/hooks/useThreads'
import { Loader2 } from 'lucide-react'
import DOMPurify from "dompurify"

export default function SearchDisplay() {
    const [searchValue] = useAtom(searchValueAtom)
    const [isSearching, setIsSearching] = useAtom(isSearchingAtom)
    const { accountId, setThreadId } = useThreads()
    const search = api.account.searchEmails.useMutation()
    const [debouncedSearchValue] = useDebounceValue(searchValue, 500);

    const handleClick = async (threadId: string) => {
        if (!threadId) return
        setIsSearching(false)
        setThreadId(threadId)
    }

    useEffect(() => {
        if (!debouncedSearchValue || !accountId) return

        search.mutate({
            accountId,
            query: debouncedSearchValue
        })
    }, [debouncedSearchValue])

    return (
        <div className='p-4 max-h-[calc(100vh-60px)] overflow-y-scroll'>
            <div className='flex items-center gap-2 mb-4 text-wrap'>
                <h2 className='text-gray-600 dark:text-gray-400 text-sm'>
                    Search result for :  {searchValue}
                </h2>
                {
                    search.isPending && <Loader2 className='animate-spin text-gray-400 size-4' />
                }
            </div>
            {
                search?.data?.hits.length === 0 ? (
                    <p className='text-center text-sm text-muted-foreground'>No result found</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {search.data?.hits.map((hit) => (
                            <li onClick={() => handleClick(hit.document.threadId)} key={hit.id} className="border rounded-md p-4 hover:bg-gray-100 cursor-pointer transition-all dark:hover:bg-gray-900 text-wrap">
                                <h3 className="text-base font-medium">{hit.document.subject}</h3>
                                <p className="text-sm text-gray-500">
                                    From: {hit.document.from}
                                </p>
                                <p className="text-sm text-gray-500">
                                    To: {hit.document.to.join(", ")}
                                </p>
                                <p className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hit.document.rawBody, { USE_PROFILES: { html: true } }) }} />
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    )
}
