
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    spaRender(req, res, "guestbook/index", "Guestbook")
})

export default router