
const wrap = document.querySelector(".eighty8x31s-wrap") as HTMLDivElement
const track = document.querySelector(".eighty8x31s") as HTMLDivElement

if (wrap && track) {
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