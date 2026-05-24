import { getDb } from "../api/queries/connection";
import { categories, products, banners } from "./schema";
import { sql } from "drizzle-orm";

const db = getDb();

async function seed() {
  console.log("Clearing existing data...");
  
  // Clear existing data using raw SQL for speed
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE categories`);
  await db.execute(sql`TRUNCATE TABLE products`);
  await db.execute(sql`TRUNCATE TABLE banners`);
  await db.execute(sql`TRUNCATE TABLE cart_items`);
  await db.execute(sql`TRUNCATE TABLE order_items`);
  await db.execute(sql`TRUNCATE TABLE orders`);
  await db.execute(sql`TRUNCATE TABLE reviews`);
  await db.execute(sql`TRUNCATE TABLE wishlist_items`);
  await db.execute(sql`TRUNCATE TABLE contact_messages`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  console.log("Seeding categories...");
  await db.insert(categories).values([
    { name: "Pesticides", slug: "pesticides", description: "Effective pest control solutions for all crops", icon: "SprayCan", productCount: 12 },
    { name: "Fertilizers", slug: "fertilizers", description: "High-quality fertilizers for maximum yield", icon: "FlaskConical", productCount: 15 },
    { name: "Fungicides", slug: "fungicides", description: "Protect your crops from fungal diseases", icon: "ShieldCheck", productCount: 8 },
    { name: "Herbicides", slug: "herbicides", description: "Weed control solutions for clean fields", icon: "Leaf", productCount: 6 },
    { name: "Insecticides", slug: "insecticides", description: "Eliminate harmful insects effectively", icon: "Bug", productCount: 10 },
    { name: "Seeds", slug: "seeds", description: "Premium quality seeds for better harvest", icon: "Sprout", productCount: 20 },
    { name: "Bio Fertilizers", slug: "bio-fertilizers", description: "Organic and eco-friendly fertilizers", icon: "Recycle", productCount: 7 },
    { name: "Organic Products", slug: "organic-products", description: "100% organic farming solutions", icon: "Apple", productCount: 9 },
    { name: "Farming Tools", slug: "farming-tools", description: "Modern tools for efficient farming", icon: "Wrench", productCount: 14 },
  ]);

  console.log("Seeding products...");

  const productData = [
    {
      name: "UPL Luster Fungicide",
      slug: "upl-luster-fungicide",
      description: "UPL Luster is a systemic fungicide with protective and curative action. It provides excellent control of powdery mildew, rust, and leaf spot diseases in various crops. The active ingredient gets absorbed quickly and translocates throughout the plant for comprehensive protection.",
      shortDescription: "Systemic fungicide for powdery mildew and rust control",
      price: "600.00", salePrice: "450.00", stock: 150, sku: "UPL-LUS-500",
      categoryId: 3, brand: "UPL", weight: "500ml", rating: "4.5", reviewCount: 128,
      badges: ["SALE", "BESTSELLER"] as string[],
      images: ["/product-1.jpg"] as string[],
      isFeatured: true, isBestseller: true,
      usageInstructions: "Mix 2-3ml per liter of water. Spray evenly on both sides of leaves. Apply at first sign of disease.",
      dosage: "2-3ml per liter of water",
      safetyInfo: "Wear protective clothing and gloves. Avoid contact with eyes and skin. Keep away from children and pets.",
    },
    {
      name: "Coromandel Gromor Fertilizer",
      slug: "coromandel-gromor-fertilizer",
      description: "Coromandel Gromor is a premium NPK fertilizer specially formulated for Indian soil conditions. It provides balanced nutrition with 17-17-17 NPK ratio, ensuring healthy plant growth, better flowering, and increased yield.",
      shortDescription: "Premium NPK 17-17-17 fertilizer for all crops",
      price: "1050.00", salePrice: "850.00", stock: 200, sku: "COR-GRM-5KG",
      categoryId: 2, brand: "Coromandel", weight: "5kg", rating: "4.7", reviewCount: 245,
      badges: ["SALE"] as string[],
      images: ["/product-2.jpg"] as string[],
      isFeatured: true, isBestseller: true,
      usageInstructions: "Apply 50-100g per plant depending on size. Mix thoroughly with soil. Water after application.",
      dosage: "50-100g per plant",
      safetyInfo: "Store in cool dry place. Avoid direct contact with skin. Wash hands after use.",
    },
    {
      name: "Syngenta Amistar Fungicide",
      slug: "syngenta-amistar-fungicide",
      description: "Syngenta Amistar is a broad-spectrum fungicide containing Azoxystrobin. It offers systemic protection against a wide range of fungal diseases including blight, mildew, and rust.",
      shortDescription: "Broad-spectrum fungicide with Azoxystrobin",
      price: "1500.00", salePrice: "1200.00", stock: 80, sku: "SYN-AMIS-1L",
      categoryId: 3, brand: "Syngenta", weight: "1L", rating: "4.8", reviewCount: 89,
      badges: ["SALE", "NEW"] as string[],
      images: ["/product-3.jpg"] as string[],
      isFeatured: true, isBestseller: false,
      usageInstructions: "Use 1ml per liter of water. Spray at 7-10 day intervals. Best applied in early morning or evening.",
      dosage: "1ml per liter of water",
      safetyInfo: "Read label before use. Use recommended protective equipment. Do not eat, drink or smoke while applying.",
    },
    {
      name: "Roundup Glyphosate Herbicide",
      slug: "roundup-glyphosate-herbicide",
      description: "Roundup is the world's most trusted glyphosate-based herbicide. It provides complete weed control by killing weeds from root to tip. Effective on over 100 types of weeds and grasses.",
      shortDescription: "Complete weed control from root to tip",
      price: "800.00", salePrice: "650.00", stock: 120, sku: "ROU-GLY-1L",
      categoryId: 4, brand: "Monsanto", weight: "1L", rating: "4.6", reviewCount: 312,
      badges: ["SALE"] as string[],
      images: ["/product-4.jpg"] as string[],
      isFeatured: false, isBestseller: true,
      usageInstructions: "Mix 10-15ml per liter of water. Spray directly on weed foliage. Avoid spray drift on desirable plants.",
      dosage: "10-15ml per liter of water",
      safetyInfo: "Non-selective herbicide - kills all vegetation. Keep away from desirable plants. Wear full protective gear.",
    },
    {
      name: "Mahyco BT Cotton Seeds",
      slug: "mahyco-bt-cotton-seeds",
      description: "Mahyco BT Cotton Seeds are genetically enhanced to provide natural resistance against bollworm pests. These premium quality seeds offer higher yield potential and better fiber quality.",
      shortDescription: "BT cotton seeds with bollworm resistance",
      price: "950.00", salePrice: "750.00", stock: 500, sku: "MAH-BT-450G",
      categoryId: 6, brand: "Mahyco", weight: "450g", rating: "4.4", reviewCount: 567,
      badges: ["SALE", "BESTSELLER"] as string[],
      images: ["/product-5.jpg"] as string[],
      isFeatured: true, isBestseller: true,
      usageInstructions: "Sow at 4-5cm depth with 75x30cm spacing. Use recommended fertilizer dose. Irrigate immediately after sowing.",
      dosage: "10-12kg per acre",
      safetyInfo: "Handle seeds with care. Do not use for food or feed. Store in cool dry place away from direct sunlight.",
    },
    {
      name: "Biostadt Bio-Fertilizer",
      slug: "biostadt-bio-fertilizer",
      description: "Biostadt Bio-Fertilizer is an eco-friendly organic fertilizer enriched with beneficial microorganisms. It improves soil health, enhances nutrient availability, and promotes vigorous root development.",
      shortDescription: "Eco-friendly bio-fertilizer with beneficial microbes",
      price: "550.00", salePrice: "420.00", stock: 100, sku: "BIO-BIO-1L",
      categoryId: 7, brand: "Biostadt", weight: "1L", rating: "4.3", reviewCount: 78,
      badges: ["NEW"] as string[],
      images: ["/product-6.jpg"] as string[],
      isFeatured: false, isBestseller: false,
      usageInstructions: "Mix 5ml per liter of water. Apply to root zone or as foliar spray. Use every 15 days for best results.",
      dosage: "5ml per liter of water",
      safetyInfo: "Organic and safe. Store away from direct sunlight. Shake well before use. Compatible with most pesticides.",
    },
    {
      name: "Bayer Confidor Insecticide",
      slug: "bayer-confidor-insecticide",
      description: "Bayer Confidor is a systemic insecticide containing Imidacloprid. It effectively controls sucking pests like aphids, jassids, whiteflies, and thrips with long residual protection.",
      shortDescription: "Systemic insecticide for sucking pest control",
      price: "400.00", salePrice: "320.00", stock: 180, sku: "BAY-CON-100ML",
      categoryId: 5, brand: "Bayer", weight: "100ml", rating: "4.6", reviewCount: 203,
      badges: ["SALE"] as string[],
      images: ["/product-7.jpg"] as string[],
      isFeatured: true, isBestseller: true,
      usageInstructions: "Mix 0.5-1ml per liter of water. Spray thoroughly covering all plant parts. Repeat after 15 days if needed.",
      dosage: "0.5-1ml per liter of water",
      safetyInfo: "Toxic to bees. Do not spray during flowering. Keep away from water bodies. Use protective equipment.",
    },
    {
      name: "IFFCO Nano Urea Liquid",
      slug: "iffco-nano-urea-liquid",
      description: "IFFCO Nano Urea is a revolutionary nano-technology based liquid fertilizer. One bottle replaces one bag of conventional urea, making it cost-effective and environmentally friendly.",
      shortDescription: "Nano-technology liquid urea fertilizer",
      price: "400.00", salePrice: "300.00", stock: 300, sku: "IFF-NANO-500",
      categoryId: 2, brand: "IFFCO", weight: "500ml", rating: "4.5", reviewCount: 445,
      badges: ["SALE", "NEW"] as string[],
      images: ["/product-8.jpg"] as string[],
      isFeatured: true, isBestseller: false,
      usageInstructions: "Mix 4-5ml per liter of water. Apply as foliar spray during active growth stages. Best results at early morning.",
      dosage: "4-5ml per liter of water",
      safetyInfo: "Handle with care. Store in original container. Keep away from children. Not for human consumption.",
    },
    {
      name: "Dawn Agro Sprayer 16L",
      slug: "dawn-agro-sprayer-16l",
      description: "Dawn Agro Sprayer is a heavy-duty knapsack sprayer with 16-liter capacity. Features brass nozzle, durable tank, comfortable padded straps, and efficient pump mechanism.",
      shortDescription: "16L knapsack sprayer with brass nozzle",
      price: "3500.00", salePrice: "2800.00", stock: 45, sku: "DAWN-SPR-16L",
      categoryId: 9, brand: "Dawn Agro", weight: "16L", rating: "4.7", reviewCount: 156,
      badges: ["SALE"] as string[],
      images: ["/product-9.jpg"] as string[],
      isFeatured: true, isBestseller: true,
      usageInstructions: "Fill tank with required solution. Pump to build pressure. Adjust nozzle for desired spray pattern. Clean after each use.",
      dosage: "N/A",
      safetyInfo: "Check for leaks before use. Clean thoroughly after each use. Store empty and dry. Replace worn parts promptly.",
    },
    {
      name: "Multiplex Micro Nutrient",
      slug: "multiplex-micro-nutrient",
      description: "Multiplex Micro Nutrient is a chelated micronutrient mixture containing Zinc, Iron, Manganese, Copper, and Boron. It corrects micronutrient deficiencies and improves crop quality.",
      shortDescription: "Chelated micronutrient mixture for all crops",
      price: "480.00", salePrice: "380.00", stock: 90, sku: "MUL-MIC-250",
      categoryId: 2, brand: "Multiplex", weight: "250g", rating: "4.4", reviewCount: 92,
      badges: ["SALE"] as string[],
      images: ["/product-10.jpg"] as string[],
      isFeatured: false, isBestseller: false,
      usageInstructions: "Dissolve 2-3g per liter of water. Spray during cooler hours. Repeat every 10-15 days during deficiency period.",
      dosage: "2-3g per liter of water",
      safetyInfo: "Avoid mixing with alkaline solutions. Store in airtight container. Use within 2 years of manufacture date.",
    },
    {
      name: "Premium Organic Compost",
      slug: "premium-organic-compost",
      description: "Premium Organic Compost is made from decomposed organic matter enriched with beneficial microorganisms. It improves soil structure, water retention, and nutrient availability.",
      shortDescription: "Enriched organic compost for soil health",
      price: "550.00", salePrice: "420.00", stock: 75, sku: "ORG-COM-5KG",
      categoryId: 8, brand: "GreenEarth", weight: "5kg", rating: "4.2", reviewCount: 67,
      badges: ["NEW"] as string[],
      images: ["/product-11.jpg"] as string[],
      isFeatured: false, isBestseller: false,
      usageInstructions: "Mix 1-2kg per square meter into topsoil. For potted plants, use 20-30% compost in potting mix. Apply every 3 months.",
      dosage: "1-2kg per square meter",
      safetyInfo: "100% organic and safe. May contain natural moisture. Store in breathable bag. Keep away from direct sunlight.",
    },
    {
      name: "Safex Agriculture PPE Kit",
      slug: "safex-agriculture-ppe-kit",
      description: "Safex Agriculture PPE Kit includes all essential protective equipment for safe pesticide and chemical application. Kit contains chemical-resistant gloves, N95 mask, safety goggles, and protective apron.",
      shortDescription: "Complete safety kit for chemical application",
      price: "700.00", salePrice: "550.00", stock: 60, sku: "SAF-PPE-KIT",
      categoryId: 9, brand: "Safex", weight: "500g", rating: "4.5", reviewCount: 134,
      badges: ["SALE"] as string[],
      images: ["/product-12.jpg"] as string[],
      isFeatured: false, isBestseller: true,
      usageInstructions: "Wear all items before handling chemicals. Ensure proper fit of mask and goggles. Replace gloves if torn.",
      dosage: "N/A",
      safetyInfo: "Inspect before each use. Replace damaged components. Wash reusable items after use. Store in dry place.",
    },
  ];

  for (const p of productData) {
    await db.insert(products).values(p);
  }

  console.log("Seeding banners...");
  await db.insert(banners).values([
    { title: "Monsoon Mega Sale", subtitle: "Up to 40% Off on All Products", image: "/hero-1.jpg", link: "/shop", order: 1, isActive: true },
    { title: "Premium Seeds Collection", subtitle: "New Arrivals for Kharif Season", image: "/hero-2.jpg", link: "/shop?category=seeds", order: 2, isActive: true },
    { title: "Organic Fertilizers", subtitle: "Natural Growth, Better Yield", image: "/hero-3.jpg", link: "/shop?category=bio-fertilizers", order: 3, isActive: true },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
