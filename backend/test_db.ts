import 'dotenv/config';
import { prisma } from './src/prisma';

async function test() {
  try {
    console.log("Fetching products...");
    const products = await prisma.product.findMany({
      include: { customizationOptions: true }
    });
    console.log(`Fetched ${products.length} products.`);
    console.log(JSON.stringify(products, null, 2).substring(0, 500));
  } catch (error: any) {
    console.error("Test Error:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
