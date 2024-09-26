import { faker } from '@faker-js/faker';

import { db } from "./client";
import { customers, regions, products, products_regions, orders, orders_products, stock_logs, type NewRegion, type NewCustomer, type NewProduct, type NewProductRegion, type Product, type Region, type Customer, type NewOrder } from "./schema";

// ==============================~~~==============================
// Seed Regions
// ==============================~~~==============================
async function seedRegions(count: number) {
    const regionData = Array.from({ length: count }).map((): NewRegion => ({
        name: faker.location.country(),
        currency: faker.finance.currencyCode(),
        timezone: faker.location.timeZone(),
    }));

    await db.insert(regions).values(regionData);
    console.log(`Seeded ${count} regions`);
    const all_regions = await db.select().from(regions);
    return all_regions
}

// ==============================~~~==============================
// Seed Customers
// ==============================~~~==============================
async function seedCustomers(count: number) {
    const customerData = Array.from({ length: count }).map((): NewCustomer => ({
        name: faker.internet.userName(),
        email: faker.internet.email(),
        address: faker.location.secondaryAddress(),
        phone: faker.phone.number({ style: "international" }),
    }));

    await db.insert(customers).values(customerData);
    console.log(`Seeded ${count} customers`);
    const all_customers = await db.select().from(customers);
    return all_customers;
}

// ==============================~~~==============================
// Seed Products
// ==============================~~~==============================
async function seedProducts(count: number) {
    const productData = Array.from({ length: count }).map((): NewProduct => ({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
    }));

    await db.insert(products).values(productData);
    console.log(`Seeded ${count} products`);
    const all_products = await db.select().from(products);
    return all_products;
}

// ==============================~~~==============================
// Seed Products Regions (Stock Level and Prices for Each Region)
// ==============================~~~==============================
async function seedProductsRegions(products: Product[], regions: Region[]) {
    const productRegionData: NewProductRegion[] = [];
    products.forEach((product) => {
        regions.forEach((region) => {
            productRegionData.push({
                product_id: product.id,
                region_id: region.id,
                price: faker.commerce.price({ min: 50, max: 1500, dec: 2 }),
                stock_level: faker.number.int({ min: 0, max: 3000 })
            })
        })
    })
    await db.insert(products_regions).values(productRegionData);
    console.log(`Seeded ${productRegionData.length} product_regions`);
}

// ==============================~~~==============================
// Main Seeder Function
// ==============================~~~==============================
export async function seedAll() {
    const regions = await seedRegions(5);
    await seedCustomers(10);
    const products = await seedProducts(20);
    await seedProductsRegions(products, regions);
}
