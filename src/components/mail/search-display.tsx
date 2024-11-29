import { useAtom } from 'jotai'
import React from 'react'
import { searchValueAtom } from './search-bar'

export default function SearchDisplay() {
    const [searchValue] = useAtom(searchValueAtom)
    return (
        <div className='p-4 max-h-[calc(100vh - 50px)] overflow-y-scroll'>
            <div className='flex items-center gap-2 mb-4'>
                <h2 className='text-gray-600 dark:text-gray-400 text-sm'>
                    Search result for :  &quot;{searchValue}&quot;
                </h2>

            </div>
        </div>
    )
}
