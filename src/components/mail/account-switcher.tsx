'use client'

import React from 'react'
import { api } from '~/trpc/react'
import { useLocalStorage } from 'usehooks-ts'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { getAurinkoAuthUrl } from '~/lib/aurinko'

type Props = {
    isCollapsed: boolean
}

export default function AccountSwitcher({ isCollapsed }: Props) {
    const { data: accounts, isLoading } = api.account.getAccounts.useQuery()
    const [accountId, setAccountId] = useLocalStorage('accountId', '')

    if (isLoading || !accounts) {
        return (
            <Button disabled variant="outline" className="w-full justify-between">
                Loading accounts...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )
    }

    const selectedAccount = accounts.find(account => account.id === accountId)

    return (
        <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger
                className={cn(
                    "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
                    isCollapsed &&
                    "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
                )}
                aria-label="Select account"
            >
                <SelectValue placeholder='Select an account'>
                    {
                        !selectedAccount?.emailAddress && (
                            <span>
                                Select an account
                            </span>
                        )
                    }
                    <span className={cn({ "hidden": !isCollapsed })}>
                        {selectedAccount?.emailAddress?.[0]}
                    </span>
                    <span className={cn({ "hidden": isCollapsed })}>
                        {selectedAccount?.emailAddress}
                    </span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {
                    accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id} >
                            {account.emailAddress}
                        </SelectItem>
                    ))
                }
                <Button
                    variant={"ghost"}
                    className='w-full'
                    onClick={async () => {
                        const authUrl = await getAurinkoAuthUrl("Google")
                        window.location.href = authUrl
                    }}
                >
                    <Plus />
                    Add account
                </Button>
            </SelectContent>
        </Select>
    )
}