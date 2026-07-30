
import Guestbook from "@/models/Guestbook"
import { verifyCsrf } from "@/utils/csrf"
import rateLimit from "@/utils/rateLimit"
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

const submitLimit = rateLimit(10 * 60 * 1000, 10)

async function getEntries() {
    return await Guestbook.find({ approved: true })
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => [])
}

router.get("/", async (req, res) => {
    spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "", text: ""})
})

router.post("/", submitLimit, verifyCsrf, async (req, res) => {
    const website = String(req.body?.website ?? "").trim()
    const name = String(req.body?.name ?? "").trim()
    const msg = String(req.body?.msg ?? "").trim()

    if (msg.length < 1 || msg.length > 500) {
        return spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "bad", "text": "Message can only be 500 characters long!" })
    }

    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`
    const safeSite = /^https?:\/\/.+/i.test(website) && website.length <= 128 ? normalized : ""

    try {
        await Guestbook.create({
            name,
            msg,
            website: safeSite,
            approved: false
        })
    } catch {
        return spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "bad", "text": "Something went wrong!" })
    }

    spaRender(req, res, "guestbook", "Guestbook", { entries: await getEntries(), type: "good", "text": "Thanks! Your entry has been submitted and is awaiting approval." })
})

export default router