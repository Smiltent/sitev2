
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    spaRender(req, res, "tools/index", "Tools")
})

export default router