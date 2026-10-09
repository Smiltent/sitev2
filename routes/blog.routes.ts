
import { getPost, getPosts, timeAgo } from "@/utils/blog.ts"
import spaRender from "@/utils/spa.ts"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    spaRender(req, res, "blog/index", "Blog", { posts: getPosts(), timeAgo })
})

router.get("/:slug", async (req, res) => {
    const { slug } = req.params
    
    const post = getPost(slug)
    if (!post) return res.status(404).render("404")

    spaRender(req, res, "blog/view", post.title, { post, timeAgo })
})

export default router