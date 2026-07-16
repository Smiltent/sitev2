
function esc(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

export function init() {
    const input = document.getElementById("key") as HTMLInputElement
    const container = document.getElementById("messages") as HTMLDivElement
    const output = document.getElementById("output") as HTMLTextAreaElement

    const addMsgBtn = document.getElementById("addMsg") as HTMLButtonElement
    const copyBtn = document.getElementById("copy") as HTMLButtonElement

    function update() {
        const key = input.value.trim()
        const msgs = Array.from(container.querySelectorAll("input"))
            .map((input) => input.value.trim())
            .filter(Boolean)

        if (!key || msgs.length === 0) {
            output.value = ""
            return
        }

        const aliases = msgs.map((message, index) => {
            const next = index === msgs.length - 1 ? "bm1" : `bm${index + 2}`
            return `alias bm${index + 1} "say ${esc(message)}; alias bm ${next}";` 
        })

        output.value = `${aliases.join(" ")} alias bm "bm1"; bind "${esc(key)}" "bm"`
    }

    function addMsg() {
        const row = document.createElement('div')
        const input = document.createElement("input")
        const removeBtn = document.createElement("button")
        
        input.type = "text"
        input.placeholder = "Message"
        input.addEventListener("input", update)

        removeBtn.type = "button"
        removeBtn.textContent = "Remove"
        removeBtn.addEventListener("click", () => {
            row.remove()
            update()
        })

        row.append(input, " ", removeBtn)
        container.append(row)
        update()
    }

    addMsg()

    input.addEventListener("input", update)
    addMsgBtn.addEventListener("click", addMsg)
    copyBtn.addEventListener("click", () => {
        if (output.value) {
            navigator.clipboard.writeText(output.value)
        }
    })
}
