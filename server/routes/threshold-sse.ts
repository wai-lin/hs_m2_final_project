import { getRedisClient } from "~/database/redis_client"
import { ThresholdChannel } from "~/utils/threshold"

// 1. subscribe to channel
// 2. send to SSE stream
export default defineEventHandler(async (event) => {
    const redis = await getRedisClient()

    const eventStream = createEventStream(event)
    eventStream.onClosed(async () => {
        await eventStream.close()
        await redis.disconnect()
    })

    // 3. subscribe to threshold channel
    redis.subscribe(ThresholdChannel, async (message) => {
        console.log("Received: ", message)
        // 4. send to SSE stream
        await eventStream.push(message)
    })

    return eventStream.send()
})
