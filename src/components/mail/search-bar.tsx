'use client'

import { Loader2, Search, X } from 'lucide-react'
import React from 'react'
import { Input } from '../ui/input'
import { atom, useAtom } from 'jotai'
import useThreads from '~/hooks/useThreads'
import { Button } from '../ui/button'

export const searchValueAtom = atom('')
export const isSearchingAtom = atom(false)

export default function SearchBar() {
    const [searchValue, setSearchValue] = useAtom(searchValueAtom)
    const [isSearching, setIsSearching] = useAtom(isSearchingAtom)
    const { isFetching } = useThreads()

    const handleBlur = () => {
        if (searchValue !== '') return
        setIsSearching(false)
    }
    return (
        <div className='m-4 px-2 flex items-center border border-input rounded-md'>
            <Search className='size-4 text-muted-foreground' />
            <Input
                placeholder='Search...'
                className='focus:ring-0 focus-visible:ring-0 border-none outline-none shadow-none text-lg'
                type='text'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => handleBlur()}
            />
            <div className='flex items-center gap-2'>
                {
                    isFetching && <Loader2 className='size-4 animate-spin text-gray-400' />
                }
                {searchValue && (
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => {
                            setIsSearching(false)
                            setSearchValue('')
                        }}
                        className='hover:bg-transparent h-5 w-5'
                    >
                        <X className='text-gray-400' />
                    </Button>
                )}
            </div>
        </div>
    )
}
