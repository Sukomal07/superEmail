import { useLocalStorage } from 'usehooks-ts'
import { api } from '~/trpc/react'
import { atom, useAtom } from "jotai"
import { useEffect, useState } from 'react'

export const threadIdAtom = atom<string | null>(null)

export default function useThreads() {
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage('tab', 'inbox')
    const [done] = useLocalStorage('done', false)
    const [threadId, setThreadId] = useAtom(threadIdAtom)
    const [skip, setSkip] = useState(0);
    const [take] = useState(50);

    const { data: accounts } = api.account.getAccounts.useQuery()

    const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
        accountId,
        tab,
        done,
        skip,
        take,
    }, {
        enabled: !!accountId && !!tab,
        placeholderData: e => e,
        refetchInterval: 5000
    });

    useEffect(() => {
        refetch()
    }, [skip])

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        threadId,
        setThreadId,
        skip,
        setSkip,
        account: accounts?.find(account => account.id === accountId)
    }
}
