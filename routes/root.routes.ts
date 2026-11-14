
import { challenge, unchallenge } from "@/middlewares/root.middleware.ts"
import { verifyCsrf } from "@/utils/csrf.ts"
import captchaOk from "@/utils/captcha.ts"
import { fileURLToPath } from "node:url"
import spaRender from "@/utils/spa.ts"
import getRealIP from "@/utils/ip.ts"
import Bots from "@/models/Bots.ts"
import path from "path"

import { Router } from "express"
const router = Router()

router.get("/", (req, res) => {
    spaRender(req, res, "index", "")
})

router.get("/whoami", (req, res) => {
    spaRender(req, res, "whoami", "Whoami", { email: process.env.EMAIL })
})

router.get("/projects", (req, res) => {
    spaRender(req, res, "projects", "Projects")
})

router.get("/robots.txt", (req, res) => {
    res.type("text/plain")
    res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "robots.txt"))
})

router.get("/_admin/env/index.html", async (req, res) => {
    const ip = getRealIP(req)
    if (await Bots.findOne({ ip })) return res.redirect("/")

    challenge(ip)
    res.status(403).render("captcha", { back: "/" })
})

router.post("/__captcha", verifyCsrf, async (req, res) => {
    const ip = getRealIP(req)
    const back = String(req.body?.back ?? "/")
    const userAgent = String(req.headers["user-agent"] ?? "")

    if (await captchaOk(String(req.body?.["cap-token"] ?? ""))) {
        unchallenge(ip)
        await Bots.updateOne({ ip }, {
            $set: { whitelisted: true, userAgent, reason: "passed scanner captcha" }
        }, { upsert: true })

        return res.redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/")
    }

    unchallenge(ip)
    if (process.env.NODE_ENV !== "dev") {
        await Bots.updateOne({ ip }, {
            $set: { whitelisted: false, userAgent, reason: "failed scanner captcha" }
        }, { upsert: true })
    }

    res.status(403).send(`Captcha failed, you've been banned! Email ${process.env.EMAIL} for an unblock.`)
})

export default router