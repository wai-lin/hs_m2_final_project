import { eq, lt } from "drizzle-orm"
import { db } from "~/database/pg_client"
import { products, products_regions, regions } from "~/database/schema"
import { StockLevelThreshold } from "./threshold"

export async function getStocksUnderThreshold(stockLevelThreshold: number = StockLevelThreshold, ctx = db) {
    return await ctx.select({
        updated_at: products_regions.updated_at,
        stock_level: products_regions.stock_level,
        product: {
            id: products.id,
            name: products.name,
        },
        region: {
            id: regions.id,
            name: regions.name,
            timezone: regions.timezone,
        },
    })
        .from(products_regions)
        .innerJoin(products, eq(products.id, products_regions.product_id))
        .innerJoin(regions, eq(regions.id, products_regions.region_id))
        .where(lt(products_regions.stock_level, stockLevelThreshold))
}