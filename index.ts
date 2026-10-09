
import { loadPosts } from "./utils/blog.ts"
import Express from "@/src/Express.ts"
import Mongo from "@/src/Mongo.ts"

import * as esbuild from "esbuild"
import path from "node:path"
import fs from "node:fs"

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
import log from './utils/log.ts'
log(process.env.NODE_ENV === "dev")

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const entries = fs.readdirSync("./private/ts")
    .filter(f => f.endsWith(".ts"))
    .map(f => path.join("./private/ts", f))

loadPosts()

await esbuild.build({
    entryPoints: entries,
    outdir: './public/js',
    bundle: true,
    platform: 'browser',
    format: 'esm',
    alias: {
        "@": "."
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? "prod")
    },
    minify: process.env.NODE_ENV !== "dev"
})
esbuild.stop()

async function main() {
    const db = new Mongo()
    await db.ready

    new Express()
}
main()