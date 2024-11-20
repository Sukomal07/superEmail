'use client'

import React, { useState } from 'react'
import Avatar from 'react-avatar';
import Select from 'react-select';
import useThreads from '~/hooks/useThreads';
import { api } from '~/trpc/react';

type Props = {
    placeholder: string
    label: string
    onChange: (values: { label: string, value: string }[]) => void
    value: { label: string, value: string }[]
}

export default function TagInput({ placeholder, label, onChange, value }: Props) {
    const [input, setInput] = useState('');
    const { accountId } = useThreads()
    const { data: suggestions } = api.account.getSuggestions.useQuery({
        accountId
    })

    const options = suggestions?.map((suggestion) => ({
        label: suggestion.address,
        value: suggestion.address,
        customLabel: (
            <span className="flex items-center gap-2">
                <Avatar name={suggestion.address} size="25" textSizeRatio={2} round={true} />
                {suggestion.address}
            </span>
        ),
    }));

    const inputOption = input
        ? {
            label: input,
            value: input,
            customLabel: (
                <span className="flex items-center gap-2">
                    <Avatar name={input} size="25" textSizeRatio={2} round={true} />
                    {input}
                </span>
            ),
        }
        : undefined;


    return (
        <div className="border rounded-md flex items-center">
            <span className='ml-3 text-sm text-gray-500'>{label}</span>
            <Select
                value={value}
                //@ts-ignore
                onChange={onChange}
                onInputChange={setInput}
                placeholder={placeholder}
                isMulti
                options={inputOption ? options?.concat(inputOption) : options}
                formatOptionLabel={(option) => (option as any).customLabel || option.label}
                className='w-full flex-1'
                classNames={{
                    control: () => {
                        return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent'
                    },
                    option: () => {
                        return 'dark:text-black'
                    },
                    multiValue: () => {
                        return 'dark:!bg-gray-700'
                    },
                    multiValueLabel: () => {
                        return 'dark:text-white dark:bg-gray-700 rounded-md'
                    }
                }}
                classNamePrefix="select"
            />
        </div>
    )
}