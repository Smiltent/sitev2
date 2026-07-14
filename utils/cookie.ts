
import type { Request } from "express"

export function getCookie(req: Request, name: string) {
    const header = req.headers.cookie
    if (!header) return null

    for (const part of header.split(";")) {
        const idx = part.indexOf("=")
        if (idx === -1) continue

        const key = part.slice(0, idx).trim()
        if (key !== name) continue

        return decodeURIComponent(part.slice(idx + 1).trim())
    }

    return null
}