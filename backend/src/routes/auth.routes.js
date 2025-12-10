const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const passport = require('passport');
require('../config/passport'); // Đảm bảo đã import passport config

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin',
        errors: {
          username: !username ? 'Tên người dùng là bắt buộc' : null,
          email: !email ? 'Email là bắt buộc' : null,
          password: !password ? 'Mật khẩu là bắt buộc' : null,
          phone: !phone ? 'Số điện thoại là bắt buộc' : null
        }
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email đã được sử dụng',
        errors: {
          email: 'Email này đã được đăng ký'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        phone,
        role: 'USER'
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route bắt đầu đăng nhập Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Thêm dòng này
  })
);

// Route callback từ Google
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }),
  async (req, res) => {
    // Tạo JWT token
    const token = jwt.sign(
      { userId: req.user.id, role: req.user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    // Trả về frontend qua redirect (hoặc response JSON nếu là API)
    const user = { ...req.user };
    delete user.password;
    // Redirect về frontend kèm token và user (dạng query string)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

module.exports = router;