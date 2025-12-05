// Manual test script for version checking
// Run this in the browser console to test version fetching

async function testVersionFetching() {
  console.log('🧪 Testing version fetching...');
  
  // Test different URL patterns that might cause 304 responses
  const testUrls = [
    './version.json',
    './version.json?t=' + Date.now(),
    '/version.json?cb=' + Math.random()
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Cache-Control: ${response.headers.get('cache-control')}`);
      
      if (response.status === 200 || response.status === 304) {
        try {
          const data = await response.json();
          console.log('✅ Success:', data);
        } catch (jsonError) {
          console.log('⚠️ Could not parse JSON (possibly 304 with no body)');
        }
      } else {
        console.log('❌ Failed:', response.status);
      }
      
      console.log('---');
      
    } catch (error) {
      console.error('❌ Request failed:', error);
    }
  }
}

// Run the test
testVersionFetching();
