
import { postCount } from "@/utils/blog"
import Bots from "@/models/Bots"

export interface Counts {
    posts: number
    bots: number
}

let pending: Promise<number> | null = null
let cached: number | null = null
let fetchedAt = 0

export default async function getCounts(): Promise<Counts> {
    return {
        posts: postCount(),
        bots: await getBotCount()
    }
}

async function getBotCount(): Promise<number> {
    if (cached !== null && Date.now() - fetchedAt < 120000) return cached
    if (pending) return pending

    pending = (async () => {
        try {
            cached = await Bots.countDocuments({ whitelisted: false })
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
