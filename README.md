
<h1 align="center">smilt.dev v2</h1>
<p align="center"><em>My personal website</em></p>
<img src="_header.png">

# About
This is my personal website, having information about myself, a blog, projects and a guestbook!

# Website
The website itself is on https://smilt.dev, but a demo version, without ratelimiting and access to the backend is on https://smilt.quack.zip

# Features
* a Blog which parses from .md files
* a Guestbook where users can write in it, all of them need to be apporoved or denied
* an Admin panel, where you review the guestbook submissions, can be found by clicking the `i` in `smil` on the footer
* Uptime data from my servers
* Spotify and Discord display
* Bot prevention - see [the blog page about it](https://smilt.dev/blog/bots)!

# Setup
Rename [.env.example](.env.example) to .env, configure values.
Hackatime api key can be found [here](https://hackatime.hackclub.com/my/settings/setup)!

Install the [Bun](https://bun.sh/) runtime. Then, run:
```sh
bun install
bun run start
```
The server will be active on `http://localhost:3000` (or whatever port you set it to)!

# AI Usage
Whilst creating, AI was used for the design (formating and some design choices), helped with the SPA (Single Page Application) system & misc backend management.
