const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = require('../lib/prisma');

// Bắt đầu đăng nhập bằng Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Xử lý callback từ Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user;

    // Tạo JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Trả token về client qua redirect kèm query string (hoặc cookie tùy bạn)
    res.redirect(`http://localhost:3000/google-success?token=${token}`);
  }
);

module.exports = router;
