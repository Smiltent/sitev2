
import Express from "@/src/Express.ts"
import Mongo from "@/src/Mongo.ts"

import path from "path"
import fs from "fs"

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// arguments
const debugArg = process.argv.find(arg => arg.startsWith("--debug"))
const debug = debugArg ? true : false

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const entries = fs.readdirSync("./private/ts")
    .filter(f => f.endsWith(".ts"))
    .map(f => path.join("./private/ts", f))

await Bun.build({
    entrypoints: entries,
    outdir: './public/js',
    target: 'browser',
    minify: true
})

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('dotenv').config()

import log from './utils/log.ts'
log(debug)

async function main() {
    const db = new Mongo()
    await db.ready

    new Express()
}
main()