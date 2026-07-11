
const url = `https://api.lanyard.rest/v1/users/${process.env.DISCORD_USER_ID}`

const sContainer = document.querySelector(".m-l-spotify-container") as HTMLDivElement

const sImg = document.querySelector("#spotifyImg") as HTMLImageElement
const sSong = document.querySelector("#spotifySong") as HTMLSpanElement
const sArtist = document.querySelector("#spotifyArtist") as HTMLSpanElement

const dStatus = document.querySelector("#discordStatus") as HTMLSpanElement
const dDot = document.querySelector("#discordStatusDot") as HTMLSpanElement

let trackUrl: string | null = null

if (sImg && sSong && sArtist && dStatus) {
    async function update() {
        const res = await fetch(url)
        const { data, success } = await res.json()

        if (!success) {
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"
            
            dStatus.textContent = "..."
            dDot.dataset.status = "offline"

            return
        }

        // spotify
        if (data.listening_to_spotify && data.spotify) {
            sImg.src = data.spotify.album_art_url
            sSong.textContent = data.spotify.song
            sArtist.textContent = data.spotify.artist

            sContainer.dataset.hasurl = "1"
            trackUrl = `https://open.spotify.com/track/${data.spotify.track_id}`
        } else {
            sImg.src = "/public/img/disc.png"
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"

            sContainer.dataset.hasurl = "0"
            trackUrl = null
        }

        // discord
        const custom = data.activities.find((a: any) => a.type === 4)
        dStatus.textContent = custom?.state ?? "..."
        dDot.dataset.status = data.discord_status
    }

    update()
    setInterval(update, 20000)
}

