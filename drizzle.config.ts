import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    database: 'warehouse',
    user: 'postgres',
    password: 'root'
  },
  verbose: true,
  strict: true,
})