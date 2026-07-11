
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

document.querySelectorAll<HTMLElement>("#h-deco-single").forEach((el) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    el.addEventListener("mouseenter", (e: MouseEvent) => spawn(e.clientX, e.clientY))
})