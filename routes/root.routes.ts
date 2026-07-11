
import getRealIP from "@/utils/ip"
import Bots from "@/models/Bots"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    res.render("index")
})

router.get("/_admin/env/index.html", async (req, res) => {
    const ip = getRealIP(req)
    const normalized = Array.isArray(ip) ? ip[0] : ip

    if (await Bots.findOne({ ip })) return res.send("If you've accessed this page, this means your IP address is whitelisted!")
    if (process.env.NODE_ENV === "dev") return res.send("You would of been banned, if the website wasn't under Dev Mode!")

    await Bots.create({
        ip: normalized,
        userAgent: req.headers["user-agent"],
        reason: "Doesn't follow robots.txt"
    })

    res.send(`You didn't follow robots.txt, you've been jailed! Please contact ${process.env.EMAIL} for an unblock.`)
})

export default router