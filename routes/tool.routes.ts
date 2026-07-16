
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    spaRender(req, res, "tools/index", "Tools")
})

router.get("/cs2-multiline", async (req, res) => {
    spaRender(req, res, "tools/cs2-multiline", "CS2 Multiline")
})

export default router