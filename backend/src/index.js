const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const prisma = require('./lib/prisma');
require('./config/passport'); // cấu hình Passport Google

// Import routes
const addressRoutes = require('./routes/address');
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const authGoogleRoutes = require('./routes/authGoogle');
const cartRoutes = require('./routes/cart.routes');
const storeRoutes = require('./routes/store');
const areaRoutes = require('./routes/area');
const uploadRouter = require("./routes/upload.router");
const commentRoutes = require('./routes/comment.routes');
const chatRoutes = require('./routes/chat.routes');
// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React frontend
  credentials: true               // Cho phép gửi cookie
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/cart', cartRoutes);
app.use('/api/comments', commentRoutes);
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (required for Passport)
app.use(session({
  secret: 'your-secret-key', // Đổi thành chuỗi bí mật riêng của bạn
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Để true nếu dùng HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/upload", uploadRouter);

// Routes
app.use('/api/addresses', addressRoutes); // Added address routes
app.use('/api/payments', paymentRoutes); // Added payment routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
//Map
app.use('/api/stores', storeRoutes);
app.use('/api/area', areaRoutes);
//app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/auth', authGoogleRoutes);
app.use('/api/chat', chatRoutes);
app.get('/api/auth/google/callback', (req, res) => {
  // Xử lý callback từ Google ở đây
  res.send('Google authentication callback received');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});