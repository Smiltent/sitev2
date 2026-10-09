
import Guestbook from "@/models/Guestbook.ts"
import { postCount } from "@/utils/blog.ts"
import Bots from "@/models/Bots.ts"

export interface Counts {
    posts: number
    bots: number
    pendingEntries: number
    guestbookEntries: number
}

export default async function getCounts(): Promise<Counts> {
    const [bots, guestbookEntries, pendingEntries] = await Promise.all([
        getBotCount(),
        getGuestbookEntries(),
        getPendingGuestbookEntries()
    ])

    return {
        posts: postCount(),
        bots,
        guestbookEntries,
        pendingEntries
    }
}

function cachedCount(fetch: () => Promise<number>) {
    let pending: Promise<number> | null = null
    let cached: number | null = null
    let fetchedAt = 0

    return async function (): Promise<number> {
        if (cached !== null && Date.now() - fetchedAt < 120000) return cached
        if (pending) return pending

        pending = (async () => {
            try {
                cached = await fetch()
                fetchedAt = Date.now()
                
                return cached
            } catch (err) {
                if (cached) return cached
                throw err
            } finally {
                pending = null
            }
        })()

        return pending
    }
}

const getBotCount = cachedCount(() => Bots.countDocuments({ whitelisted: false }))
const getGuestbookEntries = cachedCount(() => Guestbook.countDocuments({ approved: true }))
const getPendingGuestbookEntries = cachedCount(() => Guestbook.countDocuments({ approved: false }))