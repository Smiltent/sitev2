
import type { NextFunction, Request, Response } from "express"
import getRealIP from "./ip"

export default function rateLimit(windowMs: number, max: number) {
    const hits = new Map<string, number[]>()

    setInterval(() => {
        const cut = Date.now() - windowMs

        for (const [key, times] of hits) {
            const kept = times.filter(t => t > cut)
            if (kept.length) {
                hits.set(key, kept)
            } else {
                hits.delete(key)
            }
        }
    }, windowMs).unref?.()

    return (req: Request, res: Response, next: NextFunction) => {
        const ipraw = getRealIP(req) 
        const key = String(Array.isArray(ipraw) ? ipraw[0] : ipraw)

        const now = Date.now()
        const cut = now - windowMs

        const recent = (hits.get(key) ?? [])
            .filter(t => t > cut)

        if (recent.length >= max) {
            const retry = recent[0]! + windowMs - now
            res.set("Retry-After", String(Math.ceil(retry / 1000)))
            
            if (process.env.NODE_ENV !== "dev") {
                return res.status(429).send("Too many requests!")
            }
        }

        recent.push(now)
        hits.set(key, recent)
        next()
    }
}