

import { initPersistant, mountView } from "./effects"
import { initWS, apply } from "@/private/ts/ws"

const main = () => document.querySelector<HTMLElement>(".main")

let teardown: (() => void) | null = null

async function navigate(url: string, push: boolean = true) {
    const target = new URL(url, location.origin)
    const path = target.pathname + target.search

    document.body.classList.add("spa-loading")

    try {
        const res = await fetch(path, { headers: { "X-SPA": "1" }})
        if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`)

        const html = await res.text()
        const title = res.headers.get("X-Title")

        const container = main()
        if (!container) throw new Error("No .main cotainer")

        if (teardown) {
            teardown()
            teardown = null
        }

        container.innerHTML = html
        if (title) {
            document.title = title
        }

        if (push) {
            history.pushState({}, "", path)
        }

        window.scrollTo({ top: 0 })
        teardown = mountView(target.pathname) ?? null
        apply()
    } catch {
        location.href = url
    } finally {
        document.body.classList.remove("spa-loading")
    }
}

function shouldIntercept(a: HTMLAnchorElement, e: MouseEvent): boolean {
    if (e.defaultPrevented) return false
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
    if (a.target && a.target !== "_self") return false
    if (a.origin !== location.origin) return false

    const href = a.getAttribute("href") ?? ""
    if (!href || href.startsWith("#")) return false
    if (a.pathname.startsWith("/public")) return false

    return true
}

document.addEventListener("click", (e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest("a") as HTMLAnchorElement
    if (!anchor) return

    if (!shouldIntercept(anchor, e)) return

    const target = new URL(anchor.href)
    e.preventDefault()

    if (target.pathname === location.pathname && target.search === location.search) return
    navigate(target.href)
})

window.addEventListener("popstate", () => {
    navigate(location.href, false)
})

initPersistant()
initWS()

teardown = mountView(location.pathname) ?? null