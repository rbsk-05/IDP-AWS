import re

file_path = r'C:\Users\mdars\Desktop\IDP\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial state
content = content.replace(
    'const [newProduct, setNewProduct] = useState({ name: "", price: "" });',
    'const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Electronics", stock: 1 });'
)

# 2. Update saveProduct payload
content = content.replace(
    '''      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
      };''',
    '''      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category || "Electronics",
        stock: parseInt(newProduct.stock || 1, 10),
      };'''
)

# 2.5 Update reset after save
content = content.replace(
    '''      setNewProduct({ name: "", price: "" });
      setEditingId(null);''',
    '''      setNewProduct({ name: "", price: "", category: "Electronics", stock: 1 });
      setEditingId(null);'''
)

# 3. Update startEdit and cancelEdit
content = content.replace(
    '''  const startEdit = (product) => {
    setNewProduct({ name: product.name, price: typeof product.price === 'number' ? product.price.toString() : product.price });''',
    '''  const startEdit = (product) => {
    setNewProduct({ 
      name: product.name, 
      price: typeof product.price === 'number' ? product.price.toString() : product.price,
      category: product.category || "Electronics",
      stock: product.stock || 1
    });'''
)
content = content.replace(
    '''  const cancelEdit = () => {
    setNewProduct({ name: "", price: "" });''',
    '''  const cancelEdit = () => {
    setNewProduct({ name: "", price: "", category: "Electronics", stock: 1 });'''
)

# 4. Replace string literal "$" with "₹" across specific mapping points
content = content.replace(
    '{cartQuantity} items • ${cartTotal.toFixed(2)} total',
    '{cartQuantity} items • ₹{cartTotal.toFixed(2)} total'
)
content = content.replace(
    'Total: ${cartTotal.toFixed(2)}',
    'Total: ₹{cartTotal.toFixed(2)}'
)
content = content.replace(
    '${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}',
    '₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}'
)
content = content.replace(
    "${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}",
    "₹{typeof p.price === 'number' ? p.price.toFixed(2) : p.price}"
)
content = content.replace(
    '${typeof p.price === "number" ? p.price.toFixed(2) : p.price}',
    '₹{typeof p.price === "number" ? p.price.toFixed(2) : p.price}'
)

# 5. Remove SKU from display 
# Storefront (line ~455)
content = re.sub(
    r'<div style={{ fontSize: "0\.85rem", color: "#86868b", marginBottom: "1\.5rem" }}>\s*SKU: \{p\.id\.split\(\'-\'\)\[0\]\}\s*</div>',
    '<div style={{ fontSize: "0.85rem", color: "#86868b", marginBottom: "1.5rem" }}>{p.category || "General"} • {p.stock || 0} in stock</div>',
    content
)

# Admin panel logic
content = re.sub(
    r'SKU: \{p\.id\.substring\(0, 8\)\} • <span style={{ fontWeight: 600, color: "#1d1d1f" }}>',
    '{p.category || "General"} (Stock: {p.stock || 0}) • <span style={{ fontWeight: 600, color: "#1d1d1f" }}>',
    content
)

# 6. Admin Panel edit form additions (insert new input fields)
old_form_grid = '''              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Product Name
                  </label>
                  <input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. AirPods Pro"
                    style={theme.input.base}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Price ($)
                  </label>
                  <input
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    type="number"
                    placeholder="e.g. 249.00"
                    style={theme.input.base}
                  />
                </div>
              </div>'''

new_form_grid = '''              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Product Name
                  </label>
                  <input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. AirPods Pro"
                    style={theme.input.base}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Price (₹)
                  </label>
                  <input
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    type="number"
                    placeholder="e.g. 24900"
                    style={theme.input.base}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                    style={theme.input.base}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.9rem", color: "#86868b", display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Stock
                  </label>
                  <input
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                    type="number"
                    placeholder="e.g. 10"
                    style={theme.input.base}
                  />
                </div>
              </div>'''

content = content.replace(old_form_grid, new_form_grid)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File successfully updated!")
