
import type { NextFunction, Request, Response } from "express"
import isScannerPath from "@/utils/scanner.ts"
import getCounts from "@/utils/data.ts"
import getRealIP from "@/utils/ip.ts"
import Bots from "@/models/Bots.ts"

const challenged = new Map<string, number>()
const strikes = new Map<string, number>()
export const unchallenge = (ip: string) => { challenged.delete(ip); strikes.delete(ip) }
export const challenge = (ip: string) => { if (!challenged.has(ip)) challenged.set(ip, Date.now()) }

const STRIKES_NEEDED = 3
const CHALLENGE_TTL = 60 * 1000 // 1min

export default async function root(req: Request, res: Response, next: NextFunction) {
    const ip = getRealIP(req)
    const check = await Bots.findOne({ ip })

    res.locals.capUrl = process.env.CAP_URL

    if (check) {
        if (!check.whitelisted) {
            return res.send(`You've been blocked! Email ${process.env.EMAIL} for an unblock.`)
        }
    } else if (challenged.has(ip)) {
        if (Date.now() - challenged.get(ip)! > CHALLENGE_TTL) {
            unchallenge(ip)
            await Bots.updateOne({ ip }, {
                $set: { whitelisted: false, userAgent: req.headers["user-agent"] ?? "", reason: "ignored captcha" }
            }, { upsert: true })

            return res.send(`You've been blocked! Email ${process.env.EMAIL} for an unblock.`)
        }

        if (req.path !== "/__captcha" && !req.path.startsWith("/public")) {
            return res.status(403).render("captcha", { back: req.originalUrl })
        }
    } else if (isScannerPath(req.path) && process.env.NODE_ENV !== "dev") {
        const count = (strikes.get(ip) ?? 0) + 1
        strikes.set(ip, count)

        if (count >= STRIKES_NEEDED) {
            challenge(ip)
            return res.status(403).render("captcha", { back: req.originalUrl })
        }
    }

    res.locals.spa = req.get("X-SPA") === "1"
    res.locals.state = req.app.locals.live?.state ?? null
    res.locals.counts = await getCounts().catch(() => ({ posts: 0, bots: 0 }))

    res.on("finish", () => {
        console.debug(`${ip} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
    })

    next()
}