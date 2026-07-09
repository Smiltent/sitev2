
const url = `https://api.lanyard.rest/v1/users/${process.env.DISCORD_USER_ID}`

const sImg = document.querySelector("#spotifyImg") as HTMLImageElement
const sSong = document.querySelector("#spotifySong") as HTMLSpanElement
const sArtist = document.querySelector("#spotifyArtist") as HTMLSpanElement

const dUser = document.querySelector("#discordUsername") as HTMLSpanElement
const dStatus = document.querySelector("#discordStatus") as HTMLSpanElement

if (sImg && sSong && sArtist && dUser && dStatus) {
    async function update() {
        const res = await fetch(url)
        const { data, success } = await res.json()

        if (!success) {
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"
            
            dUser.textContent = "smiltene"
            dStatus.textContent = ""

            return
        }

        // spotify
        if (data.listening_to_spotify && data.spotify) {
            sImg.src = data.spotify.album_art_url
            sSong.textContent = data.spotify.song
            sArtist.textContent = data.spotify.artist
        } else {
            sSong.textContent = "Listening to"
            sArtist.textContent = "Nothing"
        }

        // discord
        const custom = data.activities.find((a: any) => a.type === 4)
        dStatus.textContent = custom?.state ?? ""
        
        dUser.textContent = data.discord_user.username
    }

    update()
}