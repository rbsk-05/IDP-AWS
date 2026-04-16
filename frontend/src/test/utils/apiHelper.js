export const getApiBase = () => {
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api";
};

export const runTestRequest = async (method, endpoint, body = null, isTestSuite = false) => {
  const url = `${getApiBase()}${endpoint}`;
  const options = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      ...(isTestSuite ? { 'x-test-suite': 'true' } : {})
    }
  };
  if (body) options.body = JSON.stringify(body);
  
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await res.json();
    } else {
        data = { message: await res.text() };
    }
    return {
      success: res.ok,
      status: res.status,
      duration: Date.now() - start,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 'ERROR',
      duration: Date.now() - start,
      data: { error: error.message }
    };
  }
};
export const apiHelpers = {
  callApi: runTestRequest,
  
  // Product
  getProducts: () => runTestRequest('GET', '/products'),
  createProduct: (product, isTestSuite = false) => runTestRequest('POST', '/products', product, isTestSuite),
  
  // Cart
  getCart: (isTestSuite = false) => runTestRequest('GET', '/cart', null, isTestSuite),
  updateCart: (items, isTestSuite = false) => runTestRequest('POST', '/cart', { items }, isTestSuite),
  clearCart: (isTestSuite = false) => runTestRequest('DELETE', '/cart', null, isTestSuite),
  
  // Orders
  placeOrder: (cartData, isTestSuite = false) => runTestRequest('POST', '/orders', cartData, isTestSuite),
  getOrderHistory: (isTestSuite = false) => runTestRequest('GET', '/orders', null, isTestSuite)
};
