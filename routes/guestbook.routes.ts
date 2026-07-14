
import Guestbook from "@/models/Guestbook"
import { verifyCsrf } from "@/utils/csrf"
import rateLimit from "@/utils/rateLimit"
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

const submitLimit = rateLimit(10 * 60 * 1000, 3)

async function getEntries() {
    return await Guestbook.find({ approved: true })
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => [])
}

router.get("/", async (req, res) => {
    spaRender(req, res, "guestbook/index", "Guestbook", { entries: await getEntries() })
})

router.post("/", submitLimit, verifyCsrf, async (req, res) => {
    const website = String(req.body?.website ?? "").trim()
    const name = String(req.body?.name ?? "").trim()
    const msg = String(req.body?.msg ?? "").trim()

    if (name.length < 1 || name.length > 32 || msg.length < 1 || msg.length > 500) {
        return res.send("Name must be max 32 char and msg must be max 500 char!!! (also you are getting this cause you manually did it or changed the html values) 😤😤")
    }

    const safeSite = /^https?:\/\/.+/i.test(website) && website.length <= 128 ? website : ""

    try {
        await Guestbook.create({
            name,
            msg,
            website: safeSite,
            approved: false
        })
    } catch {
        return spaRender(req, res, "guestbook/index", "Guestbook", { type: "good", "text": "Something went wrong!" })
    }

    spaRender(req, res, "guestbook/index", "Guestbook", { type: "good", "text": "Thanks! Your entry has been submitted and is awaiting approval." })
})

export default router