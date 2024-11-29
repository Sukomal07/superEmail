import { useLocalStorage } from 'usehooks-ts'
import { api } from '~/trpc/react'
import { atom, useAtom } from "jotai"

export const threadIdAtom = atom<string | null>(null)

export default function useThreads() {
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage('tab', 'inbox')
    const [done] = useLocalStorage('done', false)
    const [threadId, setThreadId] = useAtom(threadIdAtom)

    const { data: accounts } = api.account.getAccounts.useQuery()

    const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
        accountId,
        tab,
        done
    }, {
        enabled: !!accountId && !!tab, placeholderData: e => e, refetchInterval: 2000
    })

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        threadId,
        setThreadId,
        account: accounts?.find(account => account.id === accountId)
    }
}
