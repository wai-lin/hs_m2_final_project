import { count, desc, eq } from "drizzle-orm"
import { db } from "~/database/client"
import { products, regions, stock_logs } from "~/database/schema"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Number(query?.page || 1);
        let pageSize = Number(query?.page_size || 10);
        if (pageSize > 100) pageSize = 100;

        const rowsToSkip = (page - 1) * pageSize;

        const total_rows = await db.select({ count: count(stock_logs.id) }).from(stock_logs)
        const result = await db.select({
            id: stock_logs.id,
            product: {
                id: products.id,
                name: products.name,
            },
            region: {
                id: regions.id,
                name: regions.name,
            },
            log_date: stock_logs.log_date,
            action: stock_logs.action,
            quantity: stock_logs.quantity,
            quantity_change: stock_logs.quantity_change,
        })
            .from(stock_logs)
            .innerJoin(products, eq(products.id, stock_logs.product_id))
            .innerJoin(regions, eq(regions.id, stock_logs.region_id))
            .orderBy(desc(stock_logs.created_at))
            .offset(rowsToSkip)
            .limit(pageSize);

        setResponseStatus(event, 200);
        return { msg: "OK", result, total_rows: total_rows[0].count };
    } catch (e) {
        console.error(e);
        setResponseStatus(event, 500);
        return { msg: "Something went wrong!", result: null, total_rows: 0 };
    }
});
