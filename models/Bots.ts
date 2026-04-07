
import mongoose, { Schema } from "mongoose"

export default mongoose.model("Bots", new Schema({
    ip: { type: String, required: true, unique: true },
    whitelisted: { type: Boolean, required: true, default: false },
    userAgent: { type: String, required: true },
    reason: { type: String, required: true }
}, { timestamps: true }))
