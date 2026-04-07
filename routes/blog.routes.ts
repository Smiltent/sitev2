
import { Router } from "express"
import Posts from "../models/Posts"
const router = Router()

router.get("/", async (req, res) => {
    const posts = await Posts.find({})

    const formated = posts.map(p => ({
        id: p._id,
        title: p.title
    }))

    res.render("blog/index", { formated })
})

router.get("/view", async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(404).render("404")

    const post = await Posts.find({ _id: id })
    res.render("blog/view", { post })
})

export default router