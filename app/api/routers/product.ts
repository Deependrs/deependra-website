import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, categories, reviews } from "@db/schema";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        sort: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { categorySlug, search, sort, page = 1, limit = 12, minPrice, maxPrice } = input || {};
      
      const conditions = [];
      
      if (search) {
        conditions.push(like(products.name, `%${search}%`));
      }
      
      if (categorySlug) {
        const category = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
        if (category.length > 0) {
          conditions.push(eq(products.categoryId, category[0].id));
        }
      }
      
      if (minPrice !== undefined) {
        conditions.push(sql`${products.salePrice} >= ${minPrice}`);
      }
      if (maxPrice !== undefined) {
        conditions.push(sql`${products.salePrice} <= ${maxPrice}`);
      }
      
      conditions.push(eq(products.isActive, true));
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      let orderBy;
      switch (sort) {
        case "price-asc":
          orderBy = asc(products.salePrice);
          break;
        case "price-desc":
          orderBy = desc(products.salePrice);
          break;
        case "rating":
          orderBy = desc(products.rating);
          break;
        case "newest":
          orderBy = desc(products.createdAt);
          break;
        default:
          orderBy = desc(products.createdAt);
      }
      
      const allProducts = await db
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
          categoryId: products.categoryId,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(orderBy);
      
      const total = allProducts.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedProducts = allProducts.slice(start, start + limit);
      
      return {
        products: paginatedProducts,
        total,
        page,
        totalPages,
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
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
          categoryId: products.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
          usageInstructions: products.usageInstructions,
          dosage: products.dosage,
          safetyInfo: products.safetyInfo,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.slug, input.slug))
        .limit(1);
      
      if (product.length === 0) return null;
      
      // Get related products from same category
      const related = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          salePrice: products.salePrice,
          images: products.images,
          rating: products.rating,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, product[0].categoryId),
            sql`${products.id} != ${product[0].id}`,
            eq(products.isActive, true)
          )
        )
        .limit(4);
      
      // Get reviews
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, product[0].id));
      
      return {
        ...product[0],
        related,
        reviews: productReviews,
      };
    }),

  getFeatured: publicQuery.query(async () => {
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
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isFeatured, true))
      .orderBy(desc(products.createdAt))
      .limit(8);
  }),

  getBestsellers: publicQuery.query(async () => {
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
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isBestseller, true))
      .orderBy(desc(products.reviewCount))
      .limit(4);
  }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          salePrice: products.salePrice,
          images: products.images,
          badges: products.badges,
          rating: products.rating,
        })
        .from(products)
        .where(
          and(
            like(products.name, `%${input.query}%`),
            eq(products.isActive, true)
          )
        )
        .limit(8);
    }),
});
