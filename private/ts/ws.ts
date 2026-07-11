
const sContainer = document.querySelector(".m-l-spotify-container") as HTMLDivElement

const sImg = document.querySelector("#spotifyImg") as HTMLImageElement
const sSong = document.querySelector("#spotifySong") as HTMLSpanElement
const sArtist = document.querySelector("#spotifyArtist") as HTMLSpanElement

const dStatus = document.querySelector("#discordStatus") as HTMLSpanElement
const dDot = document.querySelector("#discordStatusDot") as HTMLSpanElement

const cToday = document.querySelector("#codingToday") as HTMLElement
const cAllTime = document.querySelector("#codingAllTime") as HTMLElement

let trackUrl: string | null = sContainer?.dataset.trackid ? `https://open.spotify.com/track/${sContainer.dataset.trackid}` : null
let backoff = 1000

function apply(state: any) {
    if (dDot && state.discord) {
        dStatus.textContent = state.discord.custom ?? "..."
        dDot.dataset.status = state.discord.status
    }

    if (sImg) {
        if (state.discord) {
            sImg.src = state.spotify.art
            sSong.textContent = state.spotify.song
            sArtist.textContent = state.spotify.artist

            sContainer.dataset.hasurl = "1"
            trackUrl = `https://open.spotify.com/track/${state.spotify.trackId}`
        } else {
            sImg.src = "/public/img/disc.png"
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"

            sContainer.dataset.hasurl = "0"
            trackUrl = null
        }
    }

    if (cToday && cAllTime && state.coding) {
        cToday.textContent = state.coding.today
        cAllTime.textContent = state.coding.allTime
    }
}

function connect() {
    const protocol = location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${protocol}://${location.host}/ws`)

    ws.addEventListener("open", () => {
        backoff = 1000
    })

    ws.addEventListener("message", (e) => {
        apply(JSON.parse(e.data))
    })

    ws.addEventListener("close", () => {
        setTimeout(connect, backoff)
        backoff = Math.min(backoff * 2, 30000) // max 30s
    })
}
connect()

sContainer.addEventListener("click", () => {
    if (trackUrl) {
        window.open(trackUrl, "_blank")
    }
})