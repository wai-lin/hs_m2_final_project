import { count, desc, eq } from "drizzle-orm"
import { db } from "~/database/client"
import { products, products_regions, regions } from "~/database/schema"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Number(query?.page || 1);
        let pageSize = Number(query?.page_size || 10);
        if (pageSize > 100) pageSize = 100;

        const rowsToSkip = (page - 1) * pageSize;
        console.log(pageSize);

        const total_rows = await db.select({ count: count(products_regions.product_id) }).from(products_regions)
        const result = await db.select({
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
            .orderBy(desc(products_regions.created_at))
            .innerJoin(products, eq(products.id, products_regions.product_id))
            .innerJoin(regions, eq(regions.id, products_regions.region_id))
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
