
import { timingSafeEqual } from "crypto"

export function safeEqual(a: string, b: string) {
    const ab = Buffer.from(a)
    const bb = Buffer.from(b)

    if (ab.length !== bb.length) return false
    try {
        return timingSafeEqual(ab, bb)
    } catch {
        return false
    }
}
