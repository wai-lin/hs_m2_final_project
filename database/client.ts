import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres({
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "warehouse",
});
export const db = drizzle(queryClient, {
    logger: true,
});
