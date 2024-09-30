# Warehouse Manager

### Setup

You can use `npm` or `pnpm`.

> IMPORTANT!
> 
> Check and Edit db credentials as needed in `database/pg_client.ts` and `database/redis_client.ts`.

```bash
pnpm install # OR npm install

pnpm migrate # OR npm run migrate

pnpm dev # OR npm run dev
```

___

### Database Seeding

```bash
curl http://localhost:3000/api/seed
```

### Browse the Project

```bash
Open http://localhost:3000 in browser.
```
