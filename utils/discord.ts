
function maskIP(ip: string): string {
    const parts = ip.split(".")
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1].slice(0, 2).padEnd(3, "*")}.***.***`
    }

    let digits = 0
    let out = ""

    for (const c of ip) {
        if (digits >= 5 && /[0-9a-f]/i.test(c)) out += "*"
        else out += c
        if (/\d/.test(c)) digits++
    }

    return out
}

async function lookupAS(ip: string): Promise<string> {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=as`, {
        signal: AbortSignal.timeout(5000)
    }).catch(() => null)

    return (await res?.json().catch(() => null))?.as ?? "unknown AS"
}

export default function notifyBan(ip: string, userAgent: string) {
    const url = process.env.DISCORD_WEBHOOK_URL
    if (!url) return

    lookupAS(ip).then(as => fetch(`${url}?with_components=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            flags: 32768,
            components: [{
                type: 17,
                accent_color: 0xed4245,
                components: [
                    { type: 10, content: `## \`${maskIP(ip)}\`` },
                    { type: 14, spacing: 1, divider: true },
                    { type: 10, content: `**UA:** ${userAgent}\n**AS:** ${as}` }
                ]
            }]
        })
    })).catch(() => {})
}
