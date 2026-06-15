const { exec } = require('child_process');
const path = require('path');
const mongoose = require('./server/node_modules/mongoose');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('Starting delete account integration test...');
  const baseUrl = 'http://localhost:5099/api';
  let token = '';
  let userId = '';
  let pharmacyId = '';
  let productId = '';

  try {
    // Connect to MongoDB and clean up old test data if it exists
    console.log('Connecting to MongoDB for pre-test cleanup...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/royal_pharmacy');
    
    const User = require('./server/models/user');
    const Cash = require('./server/models/cash');
    const Cheque = require('./server/models/cheque');
    const Return = require('./server/models/return');
    const Pharmacy = require('./server/models/pharmacy');
    const Product = require('./server/models/product');
    const Reason = require('./server/models/reason');

    const existingUser = await User.findOne({ email: 'del_test@royal.com' });
    if (existingUser) {
      console.log('Found existing test user. Cleaning up user and associated records...');
      const oldUserId = existingUser._id;
      await Cash.deleteMany({ userId: oldUserId });
      await Cheque.deleteMany({ userId: oldUserId });
      await Return.deleteMany({ userId: oldUserId });
      await Pharmacy.deleteMany({ userId: oldUserId });
      await Product.deleteMany({ userId: oldUserId });
      await Reason.deleteMany({ userId: oldUserId });
      await User.deleteOne({ _id: oldUserId });
      console.log('Cleanup finished.');
    }

    // 1. Register a new user
    console.log('1. Testing registration of a temporary test user...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account Deletion Test User',
        email: 'del_test@royal.com',
        password: 'password123',
        phone: '0771234567',
        address: '123 Test Street'
      })
    });

    if (!registerRes.ok) {
      const errText = await registerRes.text();
      throw new Error(`Registration failed with status ${registerRes.status}: ${errText}`);
    }

    const registerData = await registerRes.json();
    token = registerData.token;
    userId = registerData._id;
    console.log(`User registered successfully! ID: ${userId}`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Create a Pharmacy record under this user
    console.log('2. Creating a test pharmacy...');
    const pharmaRes = await fetch(`${baseUrl}/pharmacies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        companyName: 'Del Test Pharmacy',
        city: 'Colombo',
        contactNumber: '0771112223',
        refName: 'Del Ref',
        address: 'No 45, Main Street, Colombo'
      })
    });

    if (!pharmaRes.ok) {
      const errText = await pharmaRes.text();
      throw new Error(`Pharmacy creation failed: ${errText}`);
    }
    const pharmaData = await pharmaRes.json();
    pharmacyId = pharmaData._id;
    console.log(`Pharmacy created: ${pharmacyId}`);

    // 3. Create a Product record under this user
    console.log('3. Creating a test product...');
    const prodRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productName: 'Del Test Product',
        category: 'Tablets',
        price: 15.5,
        description: 'Temporary product'
      })
    });

    if (!prodRes.ok) {
      const errText = await prodRes.text();
      throw new Error(`Product creation failed: ${errText}`);
    }
    const prodData = await prodRes.json();
    productId = prodData._id;
    console.log(`Product created: ${productId}`);

    // 4. Create Cash, Cheque, and Return records under this user
    console.log('4. Creating transaction records (Cash, Cheque, Return)...');
    
    // Cash
    const cashRes = await fetch(`${baseUrl}/cash`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'CS-DEL-001',
        pharmacyId,
        city: 'Colombo',
        amount: 300.00
      })
    });
    if (!cashRes.ok) throw new Error('Cash creation failed');
    console.log('Cash entry created.');

    // Cheque
    const chequeRes = await fetch(`${baseUrl}/cheques`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'CHQ-DEL-001',
        pharmacyId,
        city: 'Colombo',
        chequeNumber: 'CHQ8888',
        bankName: 'Test Bank',
        amount: 1500.00
      })
    });
    if (!chequeRes.ok) throw new Error('Cheque creation failed');
    console.log('Cheque entry created.');

    // Return
    const returnRes = await fetch(`${baseUrl}/returns`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'INV-DEL-001',
        pharmacyId,
        city: 'Colombo',
        products: [productId],
        qty: [5],
        bonus: [1],
        reason: 'Damage',
        notes: 'Temporary return'
      })
    });
    if (!returnRes.ok) {
      const errText = await returnRes.text();
      throw new Error(`Return creation failed: ${errText}`);
    }
    console.log('Return entry created.');

    // 4b. Create a Reason record under this user
    console.log('4b. Creating a test reason...');
    const reasonRes = await fetch(`${baseUrl}/reasons`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasonName: 'Del Test Reason'
      })
    });
    if (!reasonRes.ok) throw new Error('Reason creation failed');
    console.log('Reason entry created.');

    // 5. Connect to MongoDB directly to verify records exist
    console.log('5. Verifying records exist in database before deletion...');

    const checkUserBefore = await User.findById(userId);
    if (!checkUserBefore) throw new Error('User not found in DB');

    const checkCashBefore = await Cash.find({ userId });
    const checkChequeBefore = await Cheque.find({ userId });
    const checkReturnBefore = await Return.find({ userId });
    const checkPharmaBefore = await Pharmacy.find({ userId });
    const checkProdBefore = await Product.find({ userId });
    const checkReasonBefore = await Reason.find({ userId });

    console.log(`Counts before delete -> Cash: ${checkCashBefore.length}, Cheque: ${checkChequeBefore.length}, Return: ${checkReturnBefore.length}, Pharmacy: ${checkPharmaBefore.length}, Product: ${checkProdBefore.length}, Reason: ${checkReasonBefore.length}`);
    if (
      checkCashBefore.length !== 1 ||
      checkChequeBefore.length !== 1 ||
      checkReturnBefore.length !== 1 ||
      checkPharmaBefore.length !== 1 ||
      checkProdBefore.length !== 1 ||
      checkReasonBefore.length !== 1
    ) {
      throw new Error('Initial record counts did not match expected values.');
    }

    // 6. Delete account
    console.log('6. Calling DELETE /api/auth/profile to delete user account...');
    const deleteRes = await fetch(`${baseUrl}/auth/profile`, {
      method: 'DELETE',
      headers: authHeaders
    });

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      throw new Error(`Account deletion failed with status ${deleteRes.status}: ${errText}`);
    }
    const deleteData = await deleteRes.json();
    console.log(`Delete API response: ${deleteData.message}`);

    // 7. Verify login fails
    console.log('7. Verifying login fails with deleted credentials...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'del_test@royal.com', password: 'password123' })
    });

    if (loginRes.ok) {
      throw new Error('Login succeeded after account was deleted!');
    }
    console.log('Login verification: Login successfully blocked.');

    // 8. Verify database cascade deletions
    console.log('8. Verifying database cascade cleanup...');
    const checkUserAfter = await User.findById(userId);
    if (checkUserAfter) throw new Error('User record was not deleted from DB');

    const checkCashAfter = await Cash.find({ userId });
    const checkChequeAfter = await Cheque.find({ userId });
    const checkReturnAfter = await Return.find({ userId });
    const checkPharmaAfter = await Pharmacy.find({ userId });
    const checkProdAfter = await Product.find({ userId });
    const checkReasonAfter = await Reason.find({ userId });

    console.log(`Counts after delete -> Cash: ${checkCashAfter.length}, Cheque: ${checkChequeAfter.length}, Return: ${checkReturnAfter.length}, Pharmacy: ${checkPharmaAfter.length}, Product: ${checkProdAfter.length}, Reason: ${checkReasonAfter.length}`);

    if (
      checkCashAfter.length !== 0 ||
      checkChequeAfter.length !== 0 ||
      checkReturnAfter.length !== 0 ||
      checkPharmaAfter.length !== 0 ||
      checkProdAfter.length !== 0 ||
      checkReasonAfter.length !== 0
    ) {
      throw new Error('Some records were not cleaned up/orphaned!');
    }

    console.log('\n=========================================');
    console.log('DELETE ACCOUNT INTEGRATION TEST PASSED!');
    console.log('=========================================');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n*** TEST FAILED ***');
    console.error(error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

// Spin up server in background, wait 3 seconds, run tests
console.log('Spinning up test server on port 5099...');
const serverProc = exec('node server/server.js', { 
  cwd: __dirname, 
  env: { ...process.env, PORT: '5099', MONGO_URI: 'mongodb://localhost:27017/royal_pharmacy' } 
});

serverProc.stdout.on('data', (data) => {
  console.log(`[TestServer]: ${data.trim()}`);
});

serverProc.stderr.on('data', (data) => {
  console.error(`[TestServer Error]: ${data.trim()}`);
});

setTimeout(async () => {
  await runTests();
  serverProc.kill();
}, 6000);
