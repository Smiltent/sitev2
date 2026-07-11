
import { getPost, getPosts } from "@/utils/blog"

import { Router } from "express"
const router = Router()

router.get("/", async (req, res) => {
    res.render("blog/index", { posts: getPosts() })
})

router.get("/:slug", async (req, res) => {
    const { slug } = req.params
    
    const post = getPost(slug)
    if (!post) return res.status(404).render("404")

    res.render("blog/view", { post })
})

export default router