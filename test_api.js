const { exec } = require('child_process');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('Starting API integration tests...');
  const baseUrl = 'http://localhost:5001/api';
  let token = '';
  let pharmacyId = '';
  let productId = '';

  try {
    // 1. Authenticate / Login
    console.log('Testing auth/login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'name@gmail.com', password: 'admin1' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('Auth login test PASSED! Token generated.');

    // Helper for auth headers
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Fetch pharmacies search
    console.log('Testing pharmacies search (autocomplete)...');
    const pharmaRes = await fetch(`${baseUrl}/pharmacies?search=Apollo`, {
      headers: authHeaders
    });
    if (!pharmaRes.ok) throw new Error('Pharmacies fetch failed');
    const pharmacies = await pharmaRes.json();
    if (pharmacies.length === 0) throw new Error('Apollo pharmacy not found');
    pharmacyId = pharmacies[0]._id;
    console.log(`Pharmacies search test PASSED! Found: ${pharmacies[0].companyName} (City: ${pharmacies[0].city})`);

    // 3. Fetch products search
    console.log('Testing products search (autocomplete)...');
    const prodRes = await fetch(`${baseUrl}/products?search=Paracetamol`, {
      headers: authHeaders
    });
    if (!prodRes.ok) throw new Error('Products fetch failed');
    const products = await prodRes.json();
    if (products.length === 0) throw new Error('Paracetamol product not found');
    productId = products[0]._id;
    console.log(`Products search test PASSED! Found: ${products[0].productName} ($${products[0].price})`);

    // 4. Create Return Entry
    console.log('Testing Return creation...');
    const returnRes = await fetch(`${baseUrl}/returns`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'INV-TEST-01',
        pharmacyId,
        city: 'New York',
        products: [productId],
        qty: [5],
        reason: 'Near Expiry',
        notes: 'Test note'
      })
    });
    if (!returnRes.ok) {
      const errTxt = await returnRes.text();
      throw new Error(`Return creation failed: ${errTxt}`);
    }
    const returnData = await returnRes.json();
    console.log(`Return log test PASSED! Invoice: ${returnData.invoiceNumber}`);

    // 5. Create Cash Entry
    console.log('Testing Cash collection creation...');
    const cashRes = await fetch(`${baseUrl}/cash`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'CS-TEST-01',
        pharmacyId,
        city: 'New York',
        amount: 250.50
      })
    });
    if (!cashRes.ok) throw new Error('Cash creation failed');
    const cashData = await cashRes.json();
    console.log(`Cash collection test PASSED! Amount: $${cashData.amount}`);

    // 6. Create Cheque Entry
    console.log('Testing Cheque collection creation...');
    const chequeRes = await fetch(`${baseUrl}/cheques`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        date: new Date(),
        invoiceNumber: 'CHQ-TEST-01',
        pharmacyId,
        city: 'New York',
        chequeNumber: 'CHQ99988',
        bankName: 'Chase Bank',
        amount: 1200.00
      })
    });
    if (!chequeRes.ok) throw new Error('Cheque creation failed');
    const chequeData = await chequeRes.json();
    console.log(`Cheque clearance test PASSED! Bank: ${chequeData.bankName}, Amount: $${chequeData.amount}`);

    console.log('\n=========================================');
    console.log('ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('=========================================');
    process.exit(0);

  } catch (error) {
    console.error('\n*** TEST SUITE FAILED ***');
    console.error(error.message);
    process.exit(1);
  }
}

// Spin up server in background, wait 2 seconds, run tests
console.log('Spinning up server.js to run tests...');
const serverProc = exec('node server/server.js', { cwd: __dirname, env: { ...process.env, PORT: '5001' } });

serverProc.stdout.on('data', (data) => {
  console.log(`[Server]: ${data.trim()}`);
});

serverProc.stderr.on('data', (data) => {
  console.error(`[Server Error]: ${data.trim()}`);
});

// Run test suite after server starts
setTimeout(async () => {
  await runTests();
  serverProc.kill();
}, 3000);
