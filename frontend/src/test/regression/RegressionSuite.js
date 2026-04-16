import { runProductUnitTests, runCartUnitTests, runSearchUnitTests } from '../unit/ArcaneUnitTests';
import { runTestRequest } from '../utils/apiHelper';

export const runFullRegressionSuite = async (onModuleComplete) => {
  const finalSummary = {
    unit: { passed: 0, failed: 0, details: [] },
    integration: { passed: 0, failed: 0, details: [] }
  };

  const logResult = (type, testData) => {
    if (testData.success) finalSummary[type].passed++;
    else finalSummary[type].failed++;
    finalSummary[type].details.push(testData);
  };

  // --- 1. RUN UNIT TESTS ---
  const unitTests = [
    ...runProductUnitTests(),
    ...runCartUnitTests(),
    ...runSearchUnitTests()
  ];
  unitTests.forEach(t => logResult('unit', t));
  onModuleComplete('Unit Tests', finalSummary.unit);

  // --- 2. RUN INTEGRATION TESTS (Isolated) ---
  
  // Product Integration
  const pRes = await runTestRequest('GET', '/products', null, true);
  logResult('integration', {
    test: 'Product Fetch (Isolated)',
    success: pRes.success,
    message: pRes.success ? 'Successfully queried test-darshan-product-table.' : 'Failed to reach test table.'
  });

  // Cart Integration
  const cRes = await runTestRequest('POST', '/cart', { items: [] }, true);
  logResult('integration', {
    test: 'Cart Reset (Isolated)',
    success: cRes.success,
    message: cRes.success ? 'Successfully cleared test-darshan-cart-table.' : 'Failed to reach test table.'
  });

  // Search Integration
  const sRes = await runTestRequest('GET', '/search?q=test', null, true);
  logResult('integration', {
    test: 'Search Scan (Isolated)',
    success: sRes.success,
    message: sRes.success ? 'Successfully searched test-darshan-search-table.' : 'Failed to reach test table.'
  });

  onModuleComplete('Integration Tests', finalSummary.integration);

  return finalSummary;
};
