import { asc, count, desc, eq, gte } from "drizzle-orm"
import { db } from "~/database/pg_client"
import { products, products_regions, regions } from "~/database/schema"
import { StockLevelThreshold } from "~/utils/threshold";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Number(query?.page || 1);
        let pageSize = Number(query?.page_size || 10);
        if (pageSize > 100) pageSize = 100;
        const product_id = String(query?.product_id || "")
        const isOverThreshold = query?.over_threshold == 'true'

        const rowsToSkip = (page - 1) * pageSize;

        const total_rows = await db.select({ count: count(products_regions.product_id) }).from(products_regions)
        const dQuery = db.select({
            product_id: products.id,
            product_name: products.name,
            price: products_regions.price,
            stock_level: products_regions.stock_level,
            region: {
                id: regions.id,
                name: regions.name,
                currency: regions.currency,
                timezone: regions.timezone,
            },
        }).from(products_regions)
            .orderBy(asc(products_regions.stock_level), desc(products_regions.created_at))
            .innerJoin(products, eq(products.id, products_regions.product_id))
            .innerJoin(regions, eq(regions.id, products_regions.region_id)).$dynamic();

        if (isOverThreshold)
            dQuery.where(gte(products_regions.stock_level, StockLevelThreshold));

        if (product_id.length > 0)
            dQuery.where(eq(products_regions.product_id, product_id))

        dQuery.offset(rowsToSkip).limit(pageSize);

        const result = await dQuery;

        setResponseStatus(event, 200);
        return { msg: "OK", result, total_rows: total_rows[0].count };
    } catch (e) {
        console.error(e);
        setResponseStatus(event, 500);
        return { msg: "Something went wrong!", result: null, total_rows: 0 };
    }
});
