
import Express from "@/src/Express.ts"
import Mongo from "@/src/Mongo.ts"

import path from "path"
import fs from "fs"

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const entries = fs.readdirSync("./private/ts")
    .filter(f => f.endsWith(".ts"))
    .map(f => path.join("./private/ts", f))

await Bun.build({
    entrypoints: entries,
    outdir: './public/js',
    target: 'browser',
    env: "inline",
    minify: true
})

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
import log from './utils/log.ts'
log(process.env.NODE_ENV === "dev")

async function main() {
    const db = new Mongo()
    await db.ready

    new Express()
}
main()