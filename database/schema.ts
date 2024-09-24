import { relations } from "drizzle-orm";
import { integer, numeric, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core"

// ==============================~~~==============================
// Definitions
// ==============================~~~==============================

const timezone_columns = {
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    deleteded_at: timestamp("updated_at"),
}

const base_columns = {
    id: uuid("id").defaultRandom().primaryKey(),
    ...timezone_columns,
}

// ==============================~~~==============================
// Tables
// ==============================~~~==============================

export const regions = pgTable("regions", {
    ...base_columns,
    name: text("name").notNull(),
    currency: text("currency").notNull(),
    timezone: text("timezone").notNull(),
});

export const customers = pgTable("customers", {
    ...base_columns,
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull()
})

export const products = pgTable("products", {
    ...base_columns,
    name: text("name"),
    description: text("description"),
});

export const products_regions = pgTable(
    "products_regions",
    {
        ...timezone_columns,
        price: numeric("price").notNull(),
        stock_level: integer("stock_level").notNull().default(0),
        product_id: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        region_id: uuid('region_id')
            .notNull()
            .references(() => regions.id, { onDelete: "cascade" }),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.product_id, table.region_id] }),
            pkWithCustomName: primaryKey({ name: "products_regions_id", columns: [table.product_id, table.region_id] }),
        }
    }
)

export const orders = pgTable("orders", {
    ...base_columns,
    order_date: timestamp("order_date").defaultNow(),
    total_price: numeric("total_price").notNull(),
    customer_id: uuid("customer_id")
        .references(() => customers.id, { onDelete: "cascade" }),
    region_id: uuid("region_id")
        .references(() => regions.id, { onDelete: "cascade" })
})

export const order_products = pgTable("order_products", {
    ...base_columns,
    quantity: integer("quantity").notNull(),
    price_at_time: numeric("price_at_time").notNull(),
    order_id: uuid("order_id")
        .references(() => orders.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" })
})

export const stock_logs = pgTable("stock_logs", {
    ...base_columns,
    log_date: timestamp("log_date").defaultNow(),
    action: text("action").notNull(), // "added", "removed", "sold"
    quantity_change: integer("quantity_change").notNull(),
    product_id: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" })
})

// ==============================~~~==============================
// Relations
// ==============================~~~==============================

export const customerRelations = relations(customers, ({ many }) => {
    return {
        orders: many(orders),
    }
})

export const regionRelations = relations(regions, ({ many }) => {
    return {
        products: many(products),
        orders: many(orders),
    }
})

export const productRelations = relations(products, ({ many }) => {
    return {
        regions: many(products_regions),
        orders: many(order_products),
        stock_logs: many(stock_logs),
    }
})

export const orderRelations = relations(orders, ({ one }) => {
    return {
        region: one(regions, {
            fields: [orders.region_id],
            references: [regions.id],
        }),
        customer: one(customers, {
            fields: [orders.customer_id],
            references: [customers.id],
        }),
    }
})

export const stockLogRelations = relations(stock_logs, ({ one }) => {
    return {
        product: one(products, {
            fields: [stock_logs.product_id],
            references: [products.id],
        })
    }
})