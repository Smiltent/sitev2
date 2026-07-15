
import { checkPassword, isAdmin, issue, reqAdmin } from "@/utils/auth"
import Guestbook from "@/models/Guestbook"
import { verifyCsrf } from "@/utils/csrf"
import rateLimit from "@/utils/rateLimit"
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

const loginLimit = rateLimit(5 * 60 * 1000, 5)

router.get("/", (req, res) => {
    res.redirect(isAdmin(req) ? '/admin/dashboard' : "/admin/login")
})

router.get("/login", (req, res) => {
    if (isAdmin(req)) return res.redirect("/admin/dashboard")
    spaRender(req, res, "admin/login", "Login", { error: null })
})

router.post("/login", verifyCsrf, loginLimit, (req, res) => {
    const pass = String(req.body?.password ?? "")

    console.log(pass)

    if (!checkPassword(pass)) {
        console.debug("WRONG PASSWORD (somehow)")
        return spaRender(req, res, "admin/login", "Admin Login", { error: "Incorrect Password" })
    }

    issue(res)
    res.redirect("/admin/dashboard")
})

router.get("/dashboard", reqAdmin, async (req, res) => {
    const [pending, approved] = await Promise.all([
        await Guestbook.find({ approved: false }).sort({ createdAt: -1 }).lean().catch(() => []),
        await Guestbook.find({ approved: true }).sort({ createdAt: -1 }).lean().catch(() => []),
    ])

    spaRender(req, res, "admin/dashboard", "Admin", { pending, approved })
})

router.post("/e/:id/approve", reqAdmin, verifyCsrf, async (req, res) => {
    await Guestbook.findByIdAndUpdate(req.params.id, { approved: true }).catch(() => null)
    res.redirect("/admin/dashboard")
}) 

router.post("/e/:id/deny", reqAdmin, verifyCsrf, async (req, res) => {
    await Guestbook.findByIdAndDelete(req.params.id).catch(() => null)
    res.redirect("/admin/dashboard")
}) 

router.post("/e/:id/delete", reqAdmin, verifyCsrf, async (req, res) => {
    await Guestbook.findByIdAndDelete(req.params.id).catch(() => null)
    res.redirect("/admin/dashboard")
}) 

export default router