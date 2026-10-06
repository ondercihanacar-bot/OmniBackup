const http = require('http');

const endpoints = [
  '/api/dashboard/stats',
  '/api/jobs',
  '/api/history',
  '/api/agents',
  '/api/destinations',
  '/api/logs',
  '/api/settings',
  '/api/shield/status',
  '/api/vss/writers',
  '/api/auth/2fa-info'
];

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3060${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ 
            path, 
            status: res.statusCode, 
            ok: res.statusCode === 200, 
            count: Array.isArray(json) ? json.length : (json.writers ? json.writers.length : Object.keys(json).length) 
          });
        } catch (e) {
          resolve({ path, status: res.statusCode, ok: false, error: e.message });
        }
      });
    }).on('error', (err) => {
      resolve({ path, status: 0, ok: false, error: err.message });
    });
  });
}

async function main() {
  console.log("=== OMNIBACKUP FULL ENTERPRISE VERIFICATION ===");
  let failed = 0;
  for (const ep of endpoints) {
    const result = await checkEndpoint(ep);
    if (result.ok) {
      console.log(`[PASS] ${result.path.padEnd(25)} -> Status: ${result.status} | Data: ${result.count} items/properties`);
    } else {
      console.log(`[FAIL] ${result.path.padEnd(25)} -> Status: ${result.status} (${result.error})`);
      failed++;
    }
  }
  console.log("================================================");
  if (failed === 0) {
    console.log(">>> ALL 10 CORE ENDPOINTS PASSED WITH 100% SUCCESS <<<");
  } else {
    console.log(`>>> ${failed} ENDPOINTS FAILED <<<`);
  }
}

main();
