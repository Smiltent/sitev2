import type { NextFunction, Request, Response } from "express"
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

    res.on("finish", () => {
        console.debug(`${ip} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
    })

    next()
}