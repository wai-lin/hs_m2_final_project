import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "~/database/pg_client"
import { getRedisClient } from "~/database/redis_client"
import { products_regions } from "~/database/schema"
import { ThresholdChannel } from "~/utils/threshold"
import { getStocksUnderThreshold } from "~/utils/threshold.server"

const restockRequestSchema = z.object({
    stock_level: z.number().min(1).default(1),
    product_id: z.string().uuid(),
    from_region_id: z.string().uuid(),
    to_region_id: z.string().uuid(),
})

// 1. minus stock from_region_id
// 2. add stock to_region_id
// 3. update redis stock_level
export default defineEventHandler(async (event) => {
    const redis = await getRedisClient()

    const body = await readBody(event)
    const parse = restockRequestSchema.safeParse(body)
    if (parse.success == false)
        return { msg: "Invalid request!", result: null, error: parse.error.format() }

    const { stock_level, product_id, from_region_id, to_region_id } = parse.data

    return await db.transaction(async (tx) => {
        try {
            // 1. minus stock from_region_id
            await db
                .update(products_regions)
                .set({ stock_level: sql`${products_regions.stock_level} - ${stock_level}` })
                .where(
                    and(
                        eq(products_regions.product_id, product_id),
                        eq(products_regions.region_id, from_region_id),
                    )
                );

            // 2. plus stock to_region_id
            await db
                .update(products_regions)
                .set({ stock_level: sql`${products_regions.stock_level} + ${stock_level}` })
                .where(
                    and(
                        eq(products_regions.product_id, product_id),
                        eq(products_regions.region_id, to_region_id),
                    )
                );

            return { msg: "Successfully restock.", result: null }
        } catch (e) {
            console.error("Error : ", e)
            tx.rollback();
            setResponseStatus(event, 500)
            return { msg: "Something went wrong!", result: null, error: e };
        } finally {
            // 3. update redis stock_level
            const thresholds = await getStocksUnderThreshold()
            redis.publish(ThresholdChannel, JSON.stringify(thresholds))
        }
    })
})
