import { count, desc } from "drizzle-orm"
import { db } from "~/database/pg_client"
import { regions } from "~/database/schema"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Number(query?.page || 1);
        let pageSize = Number(query?.page_size || 10);
        if (pageSize > 100) pageSize = 100;

        const rowsToSkip = (page - 1) * pageSize;

        const total_rows = await db.select({ count: count(regions.id) }).from(regions)
        const result = await db.select().from(regions)
            .orderBy(desc(regions.created_at))
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
