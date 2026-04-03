"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// Get all published posts
router.get('/', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const posts = await prisma_1.prisma.blogPost.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get single post
router.get('/:slug', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await prisma_1.prisma.blogPost.findUnique({
            where: { slug: slug }
        });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Admin: Create post
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, slug, content, summary, coverImage, isPublished, seoTitle, seoDesc } = req.body;
        const post = await prisma_1.prisma.blogPost.create({
            data: {
                title, slug, content, summary, coverImage, isPublished, seoTitle, seoDesc
            }
        });
        await (0, cache_1.clearCache)('blog*');
        res.status(201).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=blog.js.map