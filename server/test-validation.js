/**
 * Test script to verify property validation is working
 */

const API_BASE = 'http://localhost:5000';

const testCases = [
  {
    name: 'Valid property',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      description: 'A lovely property',
      landlord_id: 'test-landlord-123',
      image_url: '/test-image.jpg'
    },
    expectedResult: 'success'
  },
  {
    name: 'Missing title',
    data: {
      location: 'Soweto',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Title too short',
    data: {
      title: 'Hi',
      location: 'Soweto',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid price (negative)',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: -1000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid price (zero)',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: 0,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Missing location',
    data: {
      title: 'Beautiful 3BR House',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid property type',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'InvalidType',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid bedrooms (negative)',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: 5000,
      bedrooms: -5,
      bathrooms: 2,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  },
  {
    name: 'Invalid bathrooms (zero)',
    data: {
      title: 'Beautiful 3BR House',
      location: 'Soweto',
      price: 5000,
      bedrooms: 3,
      bathrooms: 0,
      property_type: 'House',
      landlord_id: 'test-landlord-123'
    },
    expectedResult: 'error'
  }
];

async function runTests() {
  console.log('🧪 Testing Property Validation\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${API_BASE}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      const isSuccess = response.ok && result.success;
      const actualResult = isSuccess ? 'success' : 'error';
      
      if (actualResult === testCase.expectedResult) {
        console.log(`✅ PASS: ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${testCase.name}`);
        console.log(`   Expected: ${testCase.expectedResult}, Got: ${actualResult}`);
        if (result.errors) {
          console.log(`   Errors: ${result.errors.join(', ')}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${testCase.name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All validation tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the validation logic.');
  }
}

// Run tests
console.log('Starting validation tests...\n');
runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});
