
import rootMiddleware from "@/middlewares/root.middleware"
import guestbookRoute from "@/routes/guestbook.routes"
import expressLayouts from "express-ejs-layouts"
import adminRoute from "@/routes/admin.routes"
import toolRoute from "@/routes/tool.routes"
import rootRoute from "@/routes/root.routes"
import blogRoute from "@/routes/blog.routes"
import LiveData from "@/src/LiveData"
import getGitInfo from "@/utils/git"
import { csrf } from '@/utils/csrf'
import express from "express"
import path from "path"
import spaRender from "@/utils/spa"

export default class Express {
    private app: express.Express

    constructor(private port: string | number = 3000) {
        this.app = express()
        this.i()
    }

    private async i() {
        await this.middleware()
        await this.public()
        await this.routes()
        this.start()
    }

    private async middleware() {
        this.app.use(expressLayouts)
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(csrf)

        this.app.set("view engine", "ejs")
        this.app.set("layout", "components/$layout")

        const git = await getGitInfo()
        this.app.locals.gitHash = git.hash
        this.app.locals.gitUrl = git.url
        this.app.locals.dev = process.env.NODE_ENV === "dev" ? true : false

        this.app.use(rootMiddleware)
    }

    private async routes() {
        this.app.use("/", rootRoute)
        this.app.use("/blog", blogRoute)
        this.app.use("/tools", toolRoute)
        this.app.use("/admin", adminRoute)
        this.app.use("/guestbook", guestbookRoute)

        this.app.use((req, res) => {
            spaRender(req, res, "404", "404", {}, 404)
        })
    }

    private async public() {
        const isDev = process.env.NODE_DEV === "dev"
        this.app.use(
            '/public',
            express.static(path.join(__dirname, '..', 'public'), {
                etag: !isDev,
                lastModified: !isDev,
                maxAge: isDev ? 0 : '10s',
            })
        )
    }

    private async start() {
        const server = this.app.listen(this.port, () => {
            console.info(`Server starting on http://0.0.0.0:${this.port}`)
        })

        this.app.locals.live = new LiveData(server)
    }
}