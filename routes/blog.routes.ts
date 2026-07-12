
import { getPost, getPosts } from "@/utils/blog"
import spaRender from "@/utils/spa"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    spaRender(req, res, "blog/index", "blog", { posts: getPosts() })
})

router.get("/:slug", async (req, res) => {
    const { slug } = req.params
    
    const post = getPost(slug)
    if (!post) return res.status(404).render("404")

    spaRender(req, res, "blog/view", post.title, { post })
})

export default router