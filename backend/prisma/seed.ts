import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
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

  // --- Seed Products ---
  const products = [
    {
      name: "Vintage Copper Tiffin",
      slug: "vintage-copper-tiffin",
      description: "Authentic 3-tier traditional design with a premium copper finish. Keeps food warm and adds a touch of elegance to your lunch.",
      price: 2499,
      category: "Vintage Collection",
      images: ["/images/product-1.png", "/images/hero.png", "/images/feature-1.png"],
      isFeatured: true,
      stock: 50,
      customizationOptions: [
        { type: "ENGRAVING", label: "Name Engraving", values: ["None", "Custom Text"], priceOffset: 200 },
        { type: "PACKAGING", label: "Gift Wrap", values: ["Standard", "Premium Velvet"], priceOffset: 150 }
      ]
    },
    {
      name: "Modern Minimalist Steel",
      slug: "modern-minimalist-steel",
      description: "Sleek, airtight, 2-tier stainless steel tiffin for the modern professional. Leak-proof and easy to clean.",
      price: 1299,
      category: "Modern Minimalist",
      images: ["/images/product-2.png", "/images/gifting.png"],
      isFeatured: true,
      stock: 100,
      customizationOptions: [
        { type: "COLOR", label: "Lid Color", values: ["Silver", "Gunmetal", "Rose Gold"], priceOffset: 0 }
      ]
    },
    {
      name: "Pastel Delight Set",
      slug: "pastel-delight-set",
      description: "4-tier tiffin set in beautiful powder-coated pastel colors. Perfect for long meals and sharing.",
      price: 1899,
      category: "Special Occasions",
      images: ["/images/product-3.png", "/images/feature-2.png"],
      isFeatured: false,
      stock: 30,
      customizationOptions: [
        { type: "COLOR", label: "Shade", values: ["Mint", "Lavender", "Peach"], priceOffset: 0 }
      ]
    },
    {
      name: "Electric Bento Pro",
      slug: "electric-bento-pro",
      description: "Self-heating, leak-proof electric bento box for office executives. Plug in and enjoy a hot meal within 15 minutes.",
      price: 3499,
      category: "Executive",
      images: ["/images/feature-1.png", "/images/product-1.png"],
      isFeatured: true,
      stock: 20,
      customizationOptions: [
        { type: "PACKAGING", label: "Carry Bag", values: ["None", "Insulated Premium"], priceOffset: 300 }
      ]
    },
    {
      name: "Kids Adventure Box",
      slug: "kids-adventure-box",
      description: "Lightweight, themed designs, BPA-free lunchbox for school kids. Durable and fun.",
      price: 899,
      category: "Kids Edition",
      images: ["/images/feature-2.png", "/images/product-2.png"],
      isFeatured: false,
      stock: 150,
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
        ...productData,
        customizationOptions: {
          deleteMany: {},
          create: customizationOptions
        }
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
      subtitle: "Customize your lunch experience with Pretty Tiffin.",
      imageUrl: "/images/hero.png",
      link: "/shop",
      order: 1
    },
    {
      title: "Gifting Made Special",
      subtitle: "Explore our range of artisanal gift sets.",
      imageUrl: "/images/gifting.png",
      link: "/shop?category=special-occasions",
      order: 2
    },
    {
      title: "Vintage Copper Collection",
      subtitle: "Timeless elegance for your daily meals.",
      imageUrl: "/images/product-1.png",
      link: "/shop?category=vintage-collection",
      order: 3
    },
    {
      title: "Modern Minimalist Range",
      subtitle: "Sleek and functional designs for professionals.",
      imageUrl: "/images/product-2.png",
      link: "/shop?category=modern-minimalist",
      order: 4
    },
    {
      title: "Special Occasion Gifts",
      subtitle: "Make memories with our vibrant lunch sets.",
      imageUrl: "/images/product-3.png",
      link: "/shop?category=special-occasions",
      order: 5
    },
    {
      title: "Premium Packaging Included",
      subtitle: "Every gift arrives beautifully wrapped.",
      imageUrl: "/images/feature-1.png",
      link: "/shop",
      order: 6
    },
    {
      title: "Kids Tiffin Collection",
      subtitle: "Durable and fun designs for little explorers.",
      imageUrl: "/images/feature-2.png",
      link: "/shop?category=kids-edition",
      order: 7
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
