
import Guestbook from "@/models/Guestbook.ts"
import { verifyCsrf } from "@/utils/csrf.ts"
import rateLimit from "@/utils/rateLimit.ts"
import notifyGotify from "@/utils/gotify.ts"
import spaRender from "@/utils/spa.ts"

import { Router } from "express"
const router = Router()

const submitLimit = rateLimit(60 * 1000, 1)

async function getEntries() {
    return await Guestbook.find({ approved: true })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean()
        .catch(() => [])
}

async function captchaOk(token: string): Promise<boolean> {
    const url = process.env.CAP_URL
    const secret = process.env.CAP_SECRET
    if (!url || !secret || !token) return false

    const res = await fetch(`${url}/siteverify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
        signal: AbortSignal.timeout(5000)
    }).catch(() => null)

    return res?.ok === true && (await res.json().catch(() => null))?.success === true
}

router.get("/", async (req, res) => {
    spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "", text: ""})
})

router.post("/", submitLimit, verifyCsrf, async (req, res) => {
    const name = String(req.body?.name ?? "").trim()
    const msg = String(req.body?.msg ?? "").trim()

    const fail = async (text: string) =>
        spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "bad", text })

    if (name.length > 32) {
        return fail("Name can only be 32 characters long!")
    }

    if (msg.length < 1 || msg.length > 500) {
        return fail("Message can only be 500 characters long!")
    }

    if (!await captchaOk(String(req.body?.["cap-token"] ?? ""))) {
        return fail("Captcha failed! Please try again.")
    }

    try {
        const dupe = await Guestbook.exists({ name, msg, approved: false })
        if (dupe) {
            return spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "good", "text": "Thanks! Your entry has been submitted and is awaiting approval." })
        }

        await Guestbook.create({
            name,
            msg,
            approved: false
        })
    } catch {
        return fail("Something went wrong!")
    }

    notifyGotify("New guestbook entry", `${name || "Anonymous"}: ${msg}`)
    spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "good", "text": "Thanks! Your entry has been submitted and is awaiting approval." })
})

export default router
