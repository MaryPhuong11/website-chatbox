const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get all reviews for a product
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(req.params.productId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new review
router.post('/products/:productId/reviews', async (req, res) => {
  try {
    const { userName, rating, text } = req.body;
    const productId = parseInt(req.params.productId);

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId,
        userName,
        rating,
        text
      }
    });

    // Update product's average rating
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });

    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { avgRating }
    });

    res.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 