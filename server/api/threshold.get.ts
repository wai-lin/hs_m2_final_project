import { getRedisClient } from "~/database/redis_client";
import { ThresholdChannel } from "~/utils/threshold"
import { getStocksUnderThreshold } from "~/utils/threshold.server";

export default defineEventHandler(async () => {
    const redis = await getRedisClient()

    // 1. get stocks under threshold
    const thresholdProducts = await getStocksUnderThreshold();
    // 2. publish to redis once
    redis.publish(ThresholdChannel, JSON.stringify(thresholdProducts));

    return thresholdProducts;
})
