import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems, products, cartItems } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const orderRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number(),
          })
        ),
        shippingAddress: z.object({
          fullName: z.string(),
          street: z.string(),
          city: z.string(),
          state: z.string(),
          pincode: z.string(),
          phone: z.string(),
        }),
        paymentMethod: z.enum(["cod", "razorpay", "upi"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Calculate total
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of input.items) {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length === 0) continue;

        const price = Number(product[0].salePrice || product[0].price);
        const total = price * item.quantity;
        totalAmount += total;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price,
          total,
        });
      }

      // Create order
      const order = await db.insert(orders).values({
        userId,
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        notes: input.notes || null,
      }).$returningId();

      const orderId = order[0].id;

      // Create order items
      for (const item of orderItemsData) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toFixed(2),
          total: item.total.toFixed(2),
        });
      }

      // Clear cart
      await db.delete(cartItems).where(eq(cartItems.userId, userId));

      return { success: true, orderId };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (order.length === 0) return null;
      if (order[0].userId !== ctx.user.id && ctx.user.role !== "admin") return null;

      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total: orderItems.total,
          productName: products.name,
          productImage: products.images,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return { ...order[0], items };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({
          status: input.status as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned",
        })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (order.length === 0 || order[0].userId !== ctx.user.id) {
        return { success: false };
      }

      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, input.id));

      return { success: true };
    }),
});
