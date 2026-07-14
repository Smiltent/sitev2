
import mongoose from "mongoose"

export default class Database {
    public ready: Promise<void>

    constructor(private uri: string = process.env.MONGO_CONNECTION!) {
        this.ready = this.connect()
    }

    private async connect() {
        try {
            console.debug("Connecting to Database...")
            await mongoose.connect(this.uri, {
                maxPoolSize: 20
            })

            console.info("Connected to Database!")
        } catch (err) {
            console.error("Failed to connect to Database, exiting...")
            process.exit(0)
        }
    }
}