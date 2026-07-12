
import type { LiveState } from "@/src/LiveData"

const sContainer = document.querySelector(".m-l-spotify-container") as HTMLDivElement

const sImg = document.querySelector("#spotifyImg") as HTMLImageElement
const sSong = document.querySelector("#spotifySong") as HTMLSpanElement
const sArtist = document.querySelector("#spotifyArtist") as HTMLSpanElement

const dStatus = document.querySelector("#discordStatus") as HTMLSpanElement
const dDot = document.querySelector("#discordStatusDot") as HTMLSpanElement

const cToday = document.querySelector("#codingToday") as HTMLElement
const cAllTime = document.querySelector("#codingAllTime") as HTMLElement

let ws: WebSocket | null = null
let latest: LiveState | null = null

let backoff = 1000

export function initWS() {
    if (!ws) {
        connect()
    }
}

function connect() {
    const protocol = location.protocol === "https:" ? "wss" : "ws"
    ws = new WebSocket(`${protocol}://${location.host}/ws`)

    ws.addEventListener("open", () => {
        backoff = 1000
    })

    ws.addEventListener("message", (e) => {
        try {
            latest = JSON.parse(e.data)
            apply()
        } catch {}
    })

    ws.addEventListener("close", () => {
        ws = null
        setTimeout(connect, backoff)
        backoff = Math.min(backoff * 2, 30000) // max 30s
    })
}

export function apply() {
    if (!latest) return
    const state = latest

    if (dDot && state.discord) {
        dStatus.textContent = state.discord.custom ?? "..."
        dDot.dataset.status = state.discord.status
    }

    if (sImg && sContainer) {
        if (state.spotify) {
            sImg.src = state.spotify.art
            sSong.textContent = state.spotify.song
            sArtist.textContent = state.spotify.artist

            sContainer.dataset.hasurl = "1"
            sContainer.dataset.trackid = state.spotify.trackId
        } else {
            sImg.src = "/public/img/disc.png"
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"

            sContainer.dataset.hasUrl = "0"
            delete sContainer.dataset.trackid
        }
    }

    if (cToday && cAllTime && state.coding) {
        cToday.textContent = state.coding.today
        cAllTime.textContent = state.coding.allTime
    }
}

// sContainer.addEventListener("click", () => {
//     if (trackUrl) {
//         window.open(trackUrl, "_blank")
//     }
// })