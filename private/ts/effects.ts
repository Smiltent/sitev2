
export function initPersistant() {    
    initSpotifyURL()
    initSparkle()
    init88x31()
    initHoneypot()
}

// spotify url
function initSpotifyURL() {
    document.addEventListener("click", (e) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>(".m-l-spotify-container")
        if (!card) return

        const id = card.dataset.trackid
        if (id) {
            window.open(`https://open.spotify.com/track/${id}`, "_blank")
        }
    })
}

// sparkles for title
function initSparkle() {
    const icons = ["✧", "·", "✦"]
    const colors = ["#d8d8d8", "#decb94", "#d9b3d0", "#96bdd3"]
    const rand = (a: number, b: number) => Math.random() * (b - a) + a

    function spawn(x: number, y: number) {
        const el = document.createElement("span") as HTMLSpanElement
        el.textContent = icons[(Math.random() * icons.length) | 0] || ""

        el.classList.add("star")
        el.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            color: ${colors[(Math.random() * colors.length | 0)]}; 
            font-size: ${rand(50, 25)}px;
        `

        document.body.appendChild(el)

        el.animate(
            [
                { transform: `translate(-50%, -50%) scale(0)`, opacity: 1 },
                { transform: `translate(calc(-50% + ${rand(-14, 14)}px), calc(-50% + ${rand(-22, -6)}px)) scale(1)`, opacity: 0.25 }
            ],
            { duration: 1500, easing: "ease-out" }
        ).onfinish = () => el.remove()
    }

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    document.querySelectorAll<HTMLElement>("#h-deco-single").forEach((el) => {
        el.addEventListener("mouseenter", (e: MouseEvent) => spawn(e.clientX, e.clientY))
    })
}

// 88x31
function init88x31() {
    const wrap = document.querySelector(".eighty8x31s-wrap") as HTMLDivElement
    const track = document.querySelector(".eighty8x31s") as HTMLDivElement

    if (!wrap || !track) return
    if (track.dataset.eexto === "1") return
    track.dataset.eexto = "1"

    const og = Array.from(track.children)
    og.forEach(el => track.appendChild(el.cloneNode(true)))

    requestAnimationFrame(() => {
        const wrapW = wrap.offsetWidth
        const halfW = track.scrollWidth / 2
        const offset = (wrapW / 2) - (halfW / 2)
        const bSpeed = 60

        const decelDur = 1200
        const accelDur = 800

        let last: number | null = null
        let speed = bSpeed
        let hover = false
        let x = offset

        track.addEventListener("mouseenter", () => { hover = true })
        track.addEventListener("mouseleave", () => { hover = false })

        function tick(now: number) {
            if (last === null) last = now
            const dt = (now - last) / 1000
            last = now

            if (hover) {
                speed = Math.max(0, speed - (bSpeed / (decelDur / 1000)) * dt)
            } else {
                speed = Math.min(bSpeed, speed + (bSpeed / (accelDur / 1000)) * dt)
            }

            x -= speed * dt

            if (x <= offset - halfW) {
                x += halfW
            }

            track.style.transform = `translateX(${x}px)`
            requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
    })
}

// honeypot
function initHoneypot() {
    document.querySelectorAll("#___DO_NOT_CLICK___YOU_WILL_BE_BANNED")?.forEach(e => e.remove())
}

export function mountView(path: string): (() => void) | void {
    if (path === "/whoami") {
        return birthday()
    }
}

function birthday(): (() => void) | void {
    const el = document.querySelector<HTMLElement>("#birth") // TODO: temp
    if (!el) return

    const [d, m, y] = "04/02/08".split("/").map(Number)
    const year = y! < 100 ? 2000 + y! : y
    
    const dob = new Date(year!, m! - 1, d)
    const ms = 365.2425 * 24 * 60 * 60 * 1000

    const render = () => { 
        el.textContent = ((Date.now() - dob.getTime()) / ms).toFixed(8)
    }
    render()

    const timer = setInterval(render, 300)
    return () => clearInterval(timer)
}