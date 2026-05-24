import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, orders, products, categories, contactMessages } from "@db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const totalOrders = await db.select({ count: count() }).from(orders);
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalProducts = await db.select({ count: count() }).from(products);
    const totalMessages = await db.select({ count: count() }).from(contactMessages);

    const revenue = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status);

    return {
      totalOrders: totalOrders[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalProducts: totalProducts[0]?.count || 0,
      totalMessages: totalMessages[0]?.count || 0,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
      ordersByStatus,
    };
  }),

  users: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(users).orderBy(desc(users.createdAt));
  }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  products: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        salePrice: products.salePrice,
        stock: products.stock,
        sku: products.sku,
        brand: products.brand,
        weight: products.weight,
        rating: products.rating,
        reviewCount: products.reviewCount,
        badges: products.badges,
        images: products.images,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isBestseller: products.isBestseller,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));
  }),

  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
