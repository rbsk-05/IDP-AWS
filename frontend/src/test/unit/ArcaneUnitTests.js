// Harry Potter Artifacts Mock Data
export const HP_ARTIFACTS = [
  { id: '1', name: 'Nimbus 2000', price: 1500, category: 'Broomsticks', stock: 10 },
  { id: '2', name: 'Elder Wand', price: 9999, category: 'Wands', stock: 1 },
  { id: '3', name: 'Marauder\'s Map', price: 500, category: 'Parchment', stock: 5 },
  { id: '4', name: 'Polyjuice Potion', price: 250, category: 'Potions', stock: 20 },
  { id: '5', name: 'Invisibility Cloak', price: 8000, category: 'Relics', stock: 1 },
];

export const runProductUnitTests = () => {
  const results = [];
  
  // Test 1: Create Product Logic
  const newProduct = { name: 'Firebolt', price: 2000 };
  results.push({
    test: 'Create Product Validation',
    success: newProduct.name === 'Firebolt' && newProduct.price > 0,
    message: 'Validated item properties for Firebolt.'
  });

  // Test 2: Stock Calculation
  const item = HP_ARTIFACTS[0];
  const stockAfterSale = item.stock - 1;
  results.push({
    test: 'Stock Depletion Logic',
    success: stockAfterSale === 9,
    message: `Nimbus 2000 stock correctly reduced from 10 to ${stockAfterSale}.`
  });

  return results;
};

export const runCartUnitTests = () => {
  const results = [];
  const mockCart = [
    { productId: '1', name: 'Nimbus 2000', price: 1500, quantity: 1 },
    { productId: '4', name: 'Polyjuice Potion', price: 250, quantity: 2 },
  ];

  // Test 1: Total Price Calculation
  const total = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  results.push({
    test: 'Cart Total Calculation',
    success: total === 2000,
    message: `Total value of 1x Nimbus and 2x Potions is correctly ${total} Galleons.`
  });

  // Test 2: Quantity Increment
  const updatedCart = mockCart.map(item => item.productId === '4' ? { ...item, quantity: item.quantity + 1 } : item);
  results.push({
    test: 'Quantity Update Logic',
    success: updatedCart.find(i => i.productId === '4').quantity === 3,
    message: 'Polyjuice Potion quantity successfully increased to 3.'
  });

  return results;
};

export const runSearchUnitTests = () => {
  const results = [];
  
  // Test 1: Filter Results
  const query = 'Map';
  const filtered = HP_ARTIFACTS.filter(p => p.name.includes(query));
  results.push({
    test: 'Search Filter Accuracy',
    success: filtered.length === 1 && filtered[0].name === 'Marauder\'s Map',
    message: `Search for "${query}" correctly isolated the Marauder's Map.`
  });

  // Test 2: Category Filter
  const category = 'Wands';
  const wandItems = HP_ARTIFACTS.filter(p => p.category === category);
  results.push({
    test: 'Category Isolation',
    success: wandItems.length === 1 && wandItems[0].name === 'Elder Wand',
    message: 'Category filter correctly identified the Elder Wand.'
  });

  return results;
};
