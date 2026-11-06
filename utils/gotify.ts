
export default function notifyGotify(title: string, message: string) {
    const url = process.env.GOTIFY_URL
    const token = process.env.GOTIFY_TOKEN
    if (!url || !token) return

    fetch(`${url}/message?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, priority: 5 })
    }).catch(() => {})
}
