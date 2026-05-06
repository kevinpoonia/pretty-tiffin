"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const stats = await prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true }
    });
    console.log('Order Stats:', JSON.stringify(stats, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=checkOrders.js.map