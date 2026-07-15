
import spaRender from "@/utils/spa"
import getRealIP from "@/utils/ip"
import Bots from "@/models/Bots"

import express, { Router } from "express"
const router = Router()

const pending = new Map()

router.get("/", (req, res) => {
    spaRender(req, res, "index", "")
})

router.get("/whoami", (req, res) => {
    spaRender(req, res, "whoami", "Whoami", { email: process.env.EMAIL })
})

router.get("/projects", (req, res) => {
    spaRender(req, res, "projects", "Projects")
})

router.get("/_admin/env/index.html", async (req, res) => {
    const ip = getRealIP(req)
    const normalized = Array.isArray(ip) ? ip[0] : ip

    if (await Bots.findOne({ ip })) return res.send("If you've accessed this page, this means your IP address is whitelisted!")
    if (process.env.NODE_ENV === "dev") return res.send("You would of been banned, if the website wasn't under Dev Mode!")

    const token = crypto.randomUUID()
    const timer = setTimeout(async () => {
        pending.delete(token)
        await Bots.create({
            ip: normalized,
            userAgent: req.headers["user-agent"],
            reason: "Doesn't follow robots.txt"
        })
    }, 20000)

    res.type("html").send(`
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <p id="msg">Checking...</p>
            <script>
                fetch("/_admin/env/verify", {
                    method: "POST",
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify({ token: ${JSON.stringify(token)} })
                }).then(() => {
                    document.getElementById("msg").textContent = "You are fine... for now"
                })
            </script>
        </body>
        </html>
    `)

    // res.send(`You didn't follow robots.txt, you've been jailed! Please contact ${process.env.EMAIL} for an unblock.`)
})

router.get("/_admin/env/verify", express.json(), (req, res) => {
    const entry = pending.get(req.body?.token)
    if (!entry) return res.sendStatus(404)

    clearTimeout(entry.timer)

    pending.delete(req.body.token)
    res.sendStatus(204)
})

export default router