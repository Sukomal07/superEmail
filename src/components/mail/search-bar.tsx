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
        <div className='mx-4 my-2 relative'>
            <Search className='size-4 absolute left-2 top-2.5 text-muted-foreground' />
            <Input
                placeholder='Search...'
                className='pl-8 pr-14 text-base'
                type='text'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => handleBlur()}
            />
            <div className='absolute right-2 top-2.5 flex items-center gap-2'>
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
                        className='hover:bg-transparent h-4 w-4'
                    >
                        <X className='text-gray-400' />
                    </Button>
                )}
            </div>
        </div>
    )
}
