
import type { Server } from "node:http"
import { WebSocketServer } from "ws"

export interface Monitor {
    name: String
    status: "up" | "down" | "pending" | "maintenance" | "unknown"
}

export interface LiveState {
    discord: { status: string, custom: string | null } | null
    spotify: { song: string, artist: string, art: string, trackId: string } | null
    coding: { today: string, allTime: string } | null
    uptime: Monitor[] | null

    updatedAt: number
}

export default class LiveData {
    public state: LiveState = { discord: null, spotify: null, coding: null, uptime: null, updatedAt: 0 }
    private wss: WebSocketServer

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server, path: "/ws" })

        this.wss.on("connection", (ws: WebSocket) => {
            ws.send(JSON.stringify(this.state))
        })

        this.refresh()
        setInterval(() => this.refresh(), 15000)
    }

    private async refresh() {
        const [discord, coding, uptime] = await Promise.allSettled([
            this.discSpot(),
            this.coding(),
            this.uptime()
        ])

        if (discord.status === "fulfilled") {
            this.state.discord = discord.value.discord
            this.state.spotify = discord.value.spotify
        }

        if (coding.status === "fulfilled") {
            this.state.coding = coding.value
        }

        if (uptime.status === "fulfilled") {
            this.state.uptime = uptime.value
        }

        this.state.updatedAt = Date.now()
        this.broadcast()
    }

    private broadcast() {
        const payload = JSON.stringify(this.state)

        for (const client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload)
            }
        }
    }

    // discord & spotiufyu
    private async discSpot() {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${process.env.DISCORD_USER_ID}`) 
        const { data, success } = await res.json() as any
        if (!success) throw new Error("discord and spotify req failed :PPP")

        const custom = data.activities?.find((a: any) => a.type === 4)

        return {
            discord: {
                status: data.discord_status as string,
                custom: (custom?.state ?? null) as string | null
            }, 
            spotify: data.listening_to_spotify && data.spotify ? {
                song: data.spotify.song as string,
                artist: data.spotify.artist as string,
                art: data.spotify.album_art_url as string,
                trackId: data.spotify.track_id as string,
            } : null
        }
    }

    private async coding() {
        const headers = { Authorization: `Bearer ${process.env.HACKATIME_API_KEY}` }

        const [allRes, todayRes] = await Promise.all([
            fetch(`https://hackatime.hackclub.com/api/v1/users/${process.env.HACKATIME_USER}/stats`),
            fetch("https://hackatime.hackclub.com/api/hackatime/v1/users/current/statusbar/today", { headers })
        ])

        if (!allRes.ok || !todayRes.ok) throw new Error("coding data req failedddddddddddd")

        const all = (await allRes.json() as any)?.data
        const today = (await todayRes.json() as any)?.data?.grand_total

        return {
            today: (today?.text ?? "0 min").replace("Start coding to track your time", "0m") as string,
            allTime: (all?.human_readable_total ?? "0 hrs") as string
        }
    }

    private async uptime() {
        const base = process.env.UPTIME_KUMA_URL!.replace(/\/$/, "")
        const slug = process.env.UPTIME_KUMA_SLUG
        
        const [pageRes, beatRes] = await Promise.all([
            fetch(`${base}/api/status-page/${slug}`),
            fetch(`${base}/api/status-page/heartbeat/${slug}`)
        ])
        if (!pageRes.ok || !beatRes.ok) throw new Error("failed to get the server stauts apge thing!~!!!!")

        const page = await pageRes.json() as any
        const { heartbeatList } = await beatRes.json() as any

        const codes: Record<number, Monitor["status"]> = {
            0: "down",
            1: "up",
            2: "pending",
            3: "maintenance"
        }

        return (page.publicGroupList ?? []).flatMap((group: any) => 
            (group.monitorList ?? []).map((m: any): Monitor => {
                const beats = heartbeatList?.[m.id] ?? []
                const last = beats[beats.length - 1]

                return {
                    name: m.name as string,
                    status: codes[last?.status] ?? "unknown"
                }
            })
        )
    }
}