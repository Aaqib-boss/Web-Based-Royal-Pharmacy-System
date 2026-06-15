require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/user');
const Pharmacy = require('./models/pharmacy');
const Product = require('./models/product');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/royal_pharmacy';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data (optional, let's keep user clean but seed admin if not exists)
    // We can clear pharmacies, products, and user accounts for a clean start
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data.');

    // Seed Admin User
    const adminUser = await User.create({
      name: 'Royal Admin',
      email: 'name@gmail.com',
      password: 'admin1', // Will be hashed by pre-save hook
      role: 'Admin',
      phone: '1234567890',
      profilePhoto: ''
    });
    console.log(`Seeded Admin User: ${adminUser.email}`);

    // Seed Regular User
    const regularUser = await User.create({
      name: 'John Staff',
      email: 'user@royal.com',
      password: 'user123', // Will be hashed by pre-save hook
      role: 'User',
      phone: '0987654321',
      profilePhoto: ''
    });
    console.log(`Seeded Staff User: ${regularUser.email}`);

    // Seed Pharmacies
    const pharmacies = [
      {
        companyName: 'Apollo Medical Hall',
        refName: 'Apollo-NY',
        address: '123 Health Ave, Metro City',
        contactNumber: '9988776655',
        city: 'New York'
      },
      {
        companyName: 'Care Pharmacy',
        refName: 'Care-CHI',
        address: '456 Wellness Blvd, Sector 4',
        contactNumber: '8877665544',
        city: 'Chicago'
      },
      {
        companyName: 'Royal Meds & Wellness',
        refName: 'Royal-LA',
        address: '789 Emerald St, Plaza Road',
        contactNumber: '7766554433',
        city: 'Los Angeles'
      },
      {
        companyName: 'Apex Medicals',
        refName: 'Apex-HOU',
        address: '321 Healing Way',
        contactNumber: '6655443322',
        city: 'Houston'
      }
    ];
    await Pharmacy.insertMany(pharmacies.map(p => ({ ...p, userId: adminUser._id })));
    console.log('Seeded Pharmacies.');

    // Seed Products
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
    console.log('Seeded Products.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
