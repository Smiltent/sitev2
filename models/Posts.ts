
import mongoose, { Schema } from "mongoose"

export default mongoose.model("Posts", new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true }))
