import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "~/database/pg_client"
import { getRedisClient } from "~/database/redis_client"
import { products_regions } from "~/database/schema"
import { ThresholdChannel } from "~/utils/threshold"
import { getStocksUnderThreshold } from "~/utils/threshold.server"

const restockRequestSchema = z.object({
    stock_level: z.number().min(1).default(1),
    product_id: z.string().uuid(),
    region_id: z.string().uuid(),
})

// 1. update stock_level
// 2. update redis stock_level
export default defineEventHandler(async (event) => {
    const redis = await getRedisClient()

    const body = await readBody(event)
    const parse = restockRequestSchema.safeParse(body)
    if (parse.success == false) 
        return { msg: "Invalid request!", result: null, error: parse.error.format() }

    // 1. update stock_level
    const { stock_level, product_id, region_id } = parse.data
    const result = await db
        .update(products_regions)
        .set({ stock_level })
        .where(
            and(
                eq(products_regions.product_id, product_id),
                eq(products_regions.region_id, region_id),
            )
        );

    // 2. update redis stock_level
    const thresholds = await getStocksUnderThreshold()
    redis.publish(ThresholdChannel, JSON.stringify(thresholds))

    return { msg: "Successfully restock.", result }
})
