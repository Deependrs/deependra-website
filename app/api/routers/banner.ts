import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { banners } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const bannerRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.order));
  }),
});
