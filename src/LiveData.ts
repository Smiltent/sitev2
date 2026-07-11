
import type { Server } from "node:http"
import { WebSocketServer } from "ws"

export interface LiveState {
    discord: { status: string, custom: string | null } | null
    spotify: { song: string, artist: string, art: string, trackId: string } | null
    coding: { today: string, allTime: string } | null

    updatedAt: number
}

export default class LiveData {
    public state: LiveState = { discord: null, spotify: null, coding: null, updatedAt: 0 }
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
        const [discord, coding] = await Promise.allSettled([
            this.discSpot(),
            this.coding()
        ])

        if (discord.status === "fulfilled") {
            this.state.discord = discord.value.discord
            this.state.spotify = discord.value.spotify
        }

        if (coding.status === "fulfilled") {
            this.state.coding = coding.value
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

        const all = (await allRes.json() as any)?.data
        const today = (await todayRes.json() as any)?.data?.grand_total

        return {
            today: (today?.text ?? "0 min") as string,
            allTime: (all?.human_readable_total ?? "0 hrs") as string
        }
    }
}