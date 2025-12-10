const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// GET all comments for a product
router.get("/product/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { productId: parseInt(productId) },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments", detail: err.message });
  }
});

// POST create new comment
router.post("/", async (req, res) => {
  const { text, productId, userId } = req.body;

  console.log("📥 Comment POST received:", { text, productId, userId });

  if (!text || !productId || isNaN(parseInt(productId))) {
    return res.status(400).json({ error: "Thiếu hoặc sai định dạng text/productId" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        productId: parseInt(productId),
        userId: userId ?? null,
      },
      include: { user: true },
    });

    console.log("✅ New comment created:", comment);
    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({
      error: "Failed to create comment",
      detail: err.message,
      meta: err.meta || null,
    });
  }
});

module.exports = router;
