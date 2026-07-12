import type { Request, Response } from "express";

const site = "smil's site"

export default function spaRender(req: Request, res: Response, view: string, title: string, data: Record<string, unknown> = {}) {
    const full = title ? `${title} - ${site}` : site
    res.locals.title = full

    if (res.locals.spa) {
        res.set("X-Title", full)
        return res.render(view, { ...data, layout: false })
    }

    return res.render(view, data)
}