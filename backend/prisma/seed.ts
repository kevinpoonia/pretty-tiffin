import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@prettytiffin.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = 'Pretty Tiffin Admin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN },
    });
    console.log(`ℹ️ User ${adminEmail} already exists. Role ensured as ADMIN.`);
  }

  // Safely clear out existing child records related to products to allow removal
  console.log('Clearing old product dependencies...');
  try { await prisma.customizationOption.deleteMany({}); } catch (e) {}
  try { await prisma.adminReview.deleteMany({}); } catch (e) {}
  try { await prisma.currencyPrice.deleteMany({}); } catch (e) {}
  // If there are order items, wishlists, or reviews, we may need to delete them. 
  // However, for safety, we only delete those that are purely product config.
  // We'll then delete products.
  
  // Note: if there are existing Orders/Reviews, deleting products may fail. We will try to delete products
  // that don't have constraints, or just delete everything if needed.
  try {
    await prisma.product.deleteMany({});
    console.log('✅ All existing products removed.');
  } catch (err) {
    console.log('⚠️ Could not remove all products (likely due to existing orders). We will upsert the new ones.');
  }

  // --- Seed Products ---
  const products = [
    {
      name: "Vintage Copper Tiffin",
      slug: "vintage-copper-tiffin",
      description: "Authentic 3-tier traditional design with a premium copper finish. Keeps food warm naturally and adds a touch of rustic elegance to your daily lunch.",
      featuresAndSpecs: "Handcrafted pure copper\n3-tier stackable design\nBrass handle with secure locking mechanism\nNaturally antimicrobial properties",
      price: 2499,
      category: "Vintage Collection",
      images: ["/images/copper_tiffin.webp"],
      isFeatured: true,
      stock: 50,
      hasSteel: false,
      hasEngraving: true,
      customizationOptions: [
        { type: "ENGRAVING", label: "Name Engraving", values: ["None", "Custom Text"], priceOffset: 200 },
        { type: "PACKAGING", label: "Gift Wrap", values: ["Standard", "Premium Velvet"], priceOffset: 150 }
      ]
    },
    {
      name: "Modern Minimalist Steel Bento",
      slug: "modern-minimalist-steel",
      description: "Sleek, airtight, 2-tier stainless steel bento box for the modern professional. Leak-proof, highly durable, and effortless to clean.",
      featuresAndSpecs: "Premium 304 Stainless Steel\nDouble-wall vacuum insulation\n100% Leak-proof silicone seals\nDishwasher safe",
      price: 1499,
      category: "Modern Minimalist",
      images: ["/images/steel_bento.webp"],
      isFeatured: true,
      stock: 100,
      hasSteel: true,
      hasEngraving: true,
      customizationOptions: [
        { type: "COLOR", label: "Lid Color", values: ["Silver", "Gunmetal", "Rose Gold"], priceOffset: 0 }
      ]
    },
    {
      name: "Pastel Delight Tiffin Set",
      slug: "pastel-delight-set",
      description: "A gorgeous 4-tier tiffin set finished in beautiful matte pastel powder-coated colors. Perfect for long meals, picnics, and sharing with loved ones.",
      featuresAndSpecs: "Food-grade stainless steel interior\nMatte pastel exterior finish\n4 spacious compartments\nSecure side latches",
      price: 1899,
      category: "Special Occasions",
      images: ["/images/pastel_tiffin.webp"],
      isFeatured: true,
      stock: 40,
      hasSteel: true,
      hasEngraving: false,
      customizationOptions: [
        { type: "COLOR", label: "Shade", values: ["Mint", "Lavender", "Peach"], priceOffset: 0 }
      ]
    },
    {
      name: "Electric Heating Bento Pro",
      slug: "electric-bento-pro",
      description: "Self-heating, leak-proof electric bento box for office executives. Plug it in via USB or wall adapter and enjoy a piping hot meal within 15 minutes.",
      featuresAndSpecs: "Rapid self-heating technology\nUSB-C and wall-plug compatible\nLED temperature indicator\nRemovable stainless steel tray for easy cleaning",
      price: 3499,
      category: "Executive",
      images: ["/images/electric_bento.webp"],
      isFeatured: true,
      stock: 25,
      hasSteel: true,
      hasEngraving: false,
      customizationOptions: [
        { type: "PACKAGING", label: "Carry Bag", values: ["None", "Insulated Premium Bag"], priceOffset: 300 }
      ]
    },
    {
      name: "Kids Adventure Lunchbox",
      slug: "kids-adventure-box",
      description: "Lightweight, durable, and playful bento box designed specifically for kids. Features fun, colorful adventure prints, easy-to-open latches, and portion-control compartments.",
      featuresAndSpecs: "BPA-Free, non-toxic materials\nDrop-proof durable outer shell\n5 portion-control compartments\nEasy-snap latches for little hands",
      price: 999,
      category: "Kids Edition",
      images: ["/images/kids_lunchbox.webp"],
      isFeatured: true,
      stock: 150,
      hasSteel: false,
      hasEngraving: true,
      customizationOptions: [
        { type: "ENGRAVING", label: "Child's Name", values: ["None", "Laser Etched"], priceOffset: 100 }
      ]
    }
  ];

  for (const p of products) {
    const { customizationOptions, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        images: p.images,
        description: p.description,
        featuresAndSpecs: p.featuresAndSpecs,
        price: p.price,
        category: p.category,
        isFeatured: p.isFeatured,
      },
      create: {
        ...productData,
        customizationOptions: {
          create: customizationOptions
        }
      }
    });
  }
  console.log(`✅ ${products.length} products seeded successfully.`);

  // --- Seed Banners ---
  await prisma.banner.deleteMany({});
  const banners = [
    {
      title: "Premium Tiffins for Every Occasion",
      subtitle: "Elevate your daily lunch with Pretty Tiffin.",
      imageUrl: "/images/banner_premium.webp",
      link: "/shop",
      order: 1
    },
    {
      title: "Timeless Vintage Copper Collection",
      subtitle: "Rediscover the art of carrying lunch with artisanal copper.",
      imageUrl: "/images/banner_vintage.webp",
      link: "/shop?category=Vintage%20Collection",
      order: 2
    },
    {
      title: "Modern Minimalist Range",
      subtitle: "Sleek. Durable. Effortlessly stylish for work and beyond.",
      imageUrl: "/images/banner_modern.webp",
      link: "/shop?category=Modern%20Minimalist",
      order: 3
    },
    {
      title: "Special Occasion Gifting Sets",
      subtitle: "Curated tiffin collections, beautifully wrapped and ready to gift.",
      imageUrl: "/images/banner_gifting.webp",
      link: "/shop?category=Special%20Occasions",
      order: 4
    },
    {
      title: "Kids Adventure Tiffins",
      subtitle: "Pack a smile! Colorful & fun lunchboxes for every journey.",
      imageUrl: "/images/banner_kids.webp",
      link: "/shop?category=Kids%20Edition",
      order: 5
    },
    {
      title: "Executive Electric Bento Series",
      subtitle: "Self-heating technology for the ultimate warm dining experience at work.",
      imageUrl: "/images/banner_executive.png",
      link: "/shop?category=Executive",
      order: 6
    }
  ];

  for (const b of banners) {
    await prisma.banner.upsert({
      where: { id: `banner-${b.order}` },
      update: b,
      create: { id: `banner-${b.order}`, ...b }
    });
  }
  console.log(`✅ ${banners.length} banners seeded successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
