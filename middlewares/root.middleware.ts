
import type { NextFunction, Request, Response } from "express"
import getCounts from "@/utils/data"
import getRealIP from "../utils/ip"
import Bots from "../models/Bots"

// handles blocking bots (on the frontend) and logging requests (only if the server has debug enabled)
export default async function root(req: Request, res: Response, next: NextFunction) {
    const ip = getRealIP(req)
    const check = await Bots.findOne({ ip })
    
    if (check) {
        if (!check.whitelisted) {
            return res.send(`You've been blocked! Email ${process.env.EMAIL} for an unblock.`)
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