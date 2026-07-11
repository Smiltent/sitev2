
import { marked } from "marked"
import path from "path"
import fs from "fs"

export interface Post {
    slug: string
    name: string
    date: string
    title: string
    html: string
}

const dir = path.join(process.cwd(), "blog")
const file_re = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/ // yyyy-mm-dd-slug.md

let posts = new Map<string, Post>()

function parse(filename: string): Post | null {
    const match = filename.match(file_re)
    const date = match?.[1]
    const name = match?.[2]
    if (!date || !name) return null

    const raw = fs.readFileSync(path.join(dir, filename), "utf8")
    const heading = raw.match(/^#\s+(.+)$/m)
    const title = heading?.[1]?.trim() ?? name.replaceAll("-", " ")

    return {
        slug: filename.slice(0, -3),
        name,
        date,
        title,
        html: marked.parse(raw, { async: false }),
    }
}

export function loadPosts() {
    const next = new Map<string, Post>()

    for (const file of fs.readdirSync(dir)) {
        try {
            const post = parse(file)
            if (post) {
                next.set(post.slug, post)
            }
        } catch (err) {
            console.error(`Failed to parse ${file}: ${err}`)
        }
    }

    posts = next
    console.debug(`Loaded ${posts.size} post(s)`)
}

export const getPost = (slug: string) => posts.get(slug) ?? null
export const getPosts = () => [...posts.values()].sort((a, b) => b.date.localeCompare(a.date))
export const postCount = () => posts.size

loadPosts()

// hot reload
let debounce: ReturnType<typeof setTimeout>
fs.watch(dir, () => {
    clearTimeout(debounce)
    debounce = setTimeout(loadPosts, 250)
})