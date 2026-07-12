
import { marked } from "marked"
import path from "path"
import fs from "fs"

export interface Post {
    slug: string
    title: string
    description: string
    date: string
    time: string
    html: string
    meta: Record<string, string>
}

const dir = path.join(process.cwd(), "blog")

let posts = new Map<string, Post>()

function parse(filename: string): Post | null {
    const raw = fs.readFileSync(path.join(dir, filename), "utf8")
    const { meta, content } = frontMeta(raw)

    const title = meta["title"]
    const description = meta["description"]
    const date = meta["date"]
    const time = meta["time"]
    if (!title || !description || !date || !time) return null

    return {
        slug: filename.slice(0, -3),
        title,
        description,
        date,
        time,
        html: marked.parse(content, { async: false }),
        meta
    }
}

function frontMeta(raw: string): { meta: Record<string, string>, content: string } {
    const meta: Record<string, string> = {}
    if (!raw.startsWith('---')) return { meta, content: raw }

    const end = raw.indexOf("\n---", 3)
    if (end === -1) return { meta, content: raw }

    for (const line of raw.slice(3, end).split('\n')) {
        const sep = line.indexOf(":")
        if (sep === -1) continue

        const key = line.slice(0, sep).trim()
        const value = line.slice(sep + 1).trim()
        if (key) {
            meta[key] = value
        }
    }

    return { meta, content: raw.slice(end + 4).replace(/^\r?\n/, "")}
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