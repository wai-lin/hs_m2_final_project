import { count, desc, eq } from "drizzle-orm"
import { db } from "~/database/pg_client"
import { customers, orders, regions } from "~/database/schema"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Number(query?.page || 1);
        let pageSize = Number(query?.page_size || 10);
        if (pageSize > 100) pageSize = 100;

        const rowsToSkip = (page - 1) * pageSize;

        const total_rows = await db.select({ count: count(orders.id) }).from(orders)
        const result = await db.select({
            id: orders.id,
            order_date: orders.order_date,
            total_price: orders.total_price,
            currency: regions.currency,
            region: {
                id: regions.id,
                name: regions.name,
                timezone: regions.timezone,
            },
            customer: {
                id: customers.id,
                name: customers.name,
                email: customers.email,
                address: customers.address,
                phone: customers.phone,
            },
        })
            .from(orders)
            .innerJoin(customers, eq(customers.id, orders.customer_id))
            .innerJoin(regions, eq(regions.id, orders.region_id))
            .orderBy(desc(orders.created_at))
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
