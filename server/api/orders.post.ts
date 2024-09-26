import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/database/pg_client";
import { getRedisClient } from "~/database/redis_client";
import { orders, orders_products, products, products_regions, stock_logs } from "~/database/schema";
import { StockLevelThreshold, ThresholdChannel } from "~/utils/threshold";
import { getStocksUnderThreshold } from "~/utils/threshold.server";

const orderRequestSchema = z.object({
    region_id: z.string().uuid(),
    customer_id: z.string().uuid(),
    order_list: z.array(
        z.object({
            product_id: z.string().uuid(),
            quantity: z.number().min(1),
        }),
    ),
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parse = orderRequestSchema.safeParse(body)
    if (parse.success == false)
        return { msg: "Invalid request!", result: null, error: parse.error.format() }

    const orderRequest = parse.data

    const redis = await getRedisClient()

    // 1. create new order
    // 2. record orders_products
    // 3. update products stock_level
    // 4. create log
    // catch: rollback transaction
    // finally: set stock_level lower than threshold on redis
    return await db.transaction(async (tx) => {
        try {
            const product_ids = orderRequest.order_list.map((ol) => ol.product_id)

            // 1. create new order
            // 1.1 prepare total_price
            const price_of_products = await tx.select({
                product_id: products.id,
                region_id: products_regions.region_id,
                price: products_regions.price,
            })
                .from(products)
                .innerJoin(products_regions, eq(products_regions.product_id, products.id))
                .where(
                    and(
                        eq(products_regions.region_id, orderRequest.region_id),
                        inArray(products.id, product_ids),
                    ),
                ).groupBy(products.id, products_regions.product_id, products_regions.region_id);

            const total_price = orderRequest.order_list.map(({ product_id, quantity }) => {
                const p = price_of_products.find((p) => p.product_id == product_id)
                const price = Number(p?.price || 0)
                const net_price = price * quantity
                return net_price
            }).reduce((a, b) => a + b, 0)

            // 1.2. create new order
            const order = await tx.insert(orders).values({
                total_price: String(total_price),
                region_id: orderRequest.region_id,
                customer_id: orderRequest.customer_id,
            }).returning({ order_id: orders.id })
            const order_id = order[0].order_id

            // 2. record orders products
            const orders_products_list = orderRequest.order_list.map((ol) => {
                const price_at_time = price_of_products.find((p) => p.product_id == ol.product_id)?.price || 0
                return {
                    price_at_time: String(price_at_time),
                    quantity: ol.quantity,
                    product_id: ol.product_id,
                    order_id,
                }
            })
            await tx.insert(orders_products).values(orders_products_list)

            for (const { product_id, quantity } of orders_products_list) {
                // 3. update product stock_levels
                const newStockLevels = await tx.update(products_regions)
                    .set({
                        stock_level: sql`${products_regions.stock_level} - ${quantity}`,
                        updated_at: sql`NOW()`
                    })
                    .where(
                        and(
                            eq(products_regions.region_id, orderRequest.region_id),
                            eq(products_regions.product_id, product_id)
                        )
                    ).returning();

                // 4. set stock_level on redis if quantity_change is lower than threshold

                // 5. create log
                // action: sold
                const newStockLevel = newStockLevels[0]
                await tx.insert(stock_logs).values({
                    action: "sold",
                    quantity,
                    quantity_change: newStockLevel.stock_level,
                    product_id: newStockLevel.product_id,
                    region_id: newStockLevel.region_id,
                })
            }

            
            return {
                msg: "Successfully received order.", result: null
            };
        } catch (e) {
            console.error("Error : ", e)
            tx.rollback();
            setResponseStatus(event, 500)
            return { msg: "Something went wrong!", result: null, error: e };
        } finally {
            // update redis stock_level
            const thresholds = await getStocksUnderThreshold(StockLevelThreshold, tx)
            redis.publish(ThresholdChannel, JSON.stringify(thresholds))
        }
    });
});
