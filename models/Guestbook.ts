

import mongoose, { Schema } from "mongoose"

export default mongoose.model("Guestbook", new Schema({
    name: { type: String, required: true, maxlength: 32, trim: true },
    msg: { type: String, required: true, maxlength: 256, trim: true },
    website: { type: String, default: "", maxlength: 128, trim: true },

    approved: { type: Boolean, required: true, default: false }
}, { timestamps: true }))
