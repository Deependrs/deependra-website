import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const cartRouter = createRouter({
  get: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId;

      let items;
      if (userId) {
        items = await db
          .select({
            id: cartItems.id,
            userId: cartItems.userId,
            sessionId: cartItems.sessionId,
            productId: cartItems.productId,
            quantity: cartItems.quantity,
            createdAt: cartItems.createdAt,
            productName: products.name,
            productSlug: products.slug,
            productPrice: products.salePrice,
            productImage: products.images,
            productStock: products.stock,
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        items = await db
          .select({
            id: cartItems.id,
            userId: cartItems.userId,
            sessionId: cartItems.sessionId,
            productId: cartItems.productId,
            quantity: cartItems.quantity,
            createdAt: cartItems.createdAt,
            productName: products.name,
            productSlug: products.slug,
            productPrice: products.salePrice,
            productImage: products.images,
            productStock: products.stock,
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.sessionId, sessionId));
      } else {
        return { items: [], total: 0 };
      }

      const total = items.reduce((sum, item) => {
        const price = Number(item.productPrice) || 0;
        const qty = Number(item.quantity) || 0;
        return sum + price * qty;
      }, 0);

      return { items, total };
    }),

  add: publicQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().default(1),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      // Check if product already in cart
      let existing;
      if (userId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, input.productId)
            )
          )
          .limit(1);
      } else if (input.sessionId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.sessionId, input.sessionId),
              eq(cartItems.productId, input.productId)
            )
          )
          .limit(1);
      }

      if (existing && existing.length > 0) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(cartItems.id, existing[0].id));
        return { success: true, action: "updated" };
      }

      // Insert new
      await db.insert(cartItems).values({
        userId: userId || null,
        sessionId: input.sessionId || null,
        productId: input.productId,
        quantity: input.quantity,
      });

      return { success: true, action: "added" };
    }),

  update: publicQuery
    .input(z.object({ itemId: z.number(), quantity: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.quantity <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq(cartItems.id, input.itemId));
      }
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else if (input?.sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, input.sessionId));
      }
      return { success: true };
    }),

  getCount: publicQuery
    .input(z.object({ sessionId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      let result;
      if (userId) {
        result = await db
          .select({ count: cartItems.quantity })
          .from(cartItems)
          .where(eq(cartItems.userId, userId));
      } else if (input?.sessionId) {
        result = await db
          .select({ count: cartItems.quantity })
          .from(cartItems)
          .where(eq(cartItems.sessionId, input.sessionId));
      } else {
        return 0;
      }

      return result.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    }),
});
