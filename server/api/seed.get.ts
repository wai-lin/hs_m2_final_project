import { seedAll } from "~/database/seeder";

export default defineEventHandler(async (event) => {
    let status = 200
    let msg = ""
    let err: any = null

    await seedAll().then(() => {
        msg = "Database seeding completed!"
    }).catch((error) => {
        msg = "Error seeding database."
        err = error
        status = 500
    });

    setResponseStatus(event, status);
    return { msg, error: err }
});
