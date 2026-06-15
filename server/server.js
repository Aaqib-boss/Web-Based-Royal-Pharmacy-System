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
  origin: 'http://localhost:3050', // Vite client dev server URL
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
