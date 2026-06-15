require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
// Import routes
const authRoutes = require('./routes/authRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const productRoutes = require('./routes/productRoutes');
const returnRoutes = require('./routes/returnRoutes');
const cashRoutes = require('./routes/cashRoutes');
const chequeRoutes = require('./routes/chequeRoutes');
const reasonRoutes = require('./routes/reasonRoutes');
// Connect to Database
connectDB();
const app = express();
// Middleware
app.use(cors({
  origin: ['http://localhost:3050', 'https://web-based-royal-pharmacy-system-4q6qtbhfu.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static profile photo files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/cheques', chequeRoutes);
app.use('/api/reasons', reasonRoutes);
// Temporary seed route
app.get('/api/seed-temp', async (req, res) => {
  try {
    const User = require('./models/user');
    const Pharmacy = require('./models/pharmacy');
    const Product = require('./models/product');
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Product.deleteMany({});
    const adminUser = await User.create({
      name: 'Royal Admin',
      email: 'name@gmail.com',
      password: 'admin1',
      role: 'Admin',
      phone: '1234567890',
      profilePhoto: ''
    });
    await User.create({
      name: 'John Staff',
      email: 'user@royal.com',
      password: 'user123',
      role: 'User',
      phone: '0987654321',
      profilePhoto: ''
    });
    const pharmacies = [
      { companyName: 'Apollo Medical Hall', refName: 'Apollo-NY', address: '123 Health Ave', contactNumber: '9988776655', city: 'New York' },
      { companyName: 'Care Pharmacy', refName: 'Care-CHI', address: '456 Wellness Blvd', contactNumber: '8877665544', city: 'Chicago' },
      { companyName: 'Royal Meds & Wellness', refName: 'Royal-LA', address: '789 Emerald St', contactNumber: '7766554433', city: 'Los Angeles' },
      { companyName: 'Apex Medicals', refName: 'Apex-HOU', address: '321 Healing Way', contactNumber: '6655443322', city: 'Houston' }
    ];
    await Pharmacy.insertMany(pharmacies.map(p => ({ ...p, userId: adminUser._id })));
    const products = [
      { productName: 'Paracetamol 500mg', price: 2.50 },
      { productName: 'Amoxicillin 250mg', price: 12.00 },
      { productName: 'Ibuprofen 400mg', price: 4.25 },
      { productName: 'Lipitor 10mg', price: 45.00 },
      { productName: 'Metformin 500mg', price: 8.50 },
      { productName: 'Aspirin 81mg', price: 1.99 },
      { productName: 'Cetirizine 10mg', price: 6.50 },
      { productName: 'Omeprazole 20mg', price: 15.75 }
    ];
    await Product.insertMany(products.map(p => ({ ...p, userId: adminUser._id })));
    res.json({ success: true, message: 'Database seeded successfully!', admin: 'name@gmail.com / admin1', user: 'user@royal.com / user123' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
