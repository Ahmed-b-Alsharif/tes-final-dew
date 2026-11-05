// admin.js (Supabase Version)
let D = { settings: {}, catalogs: [], products: [] };
let tab = 'products', q = '';

async function start() {
  await loadData();
  render();
}

async function loadData() {
  const [sRes, cRes, pRes] = await Promise.all([
    supabase.from('store_settings').select('*').single(),
    supabase.from('catalogs').select('*'),
    supabase.from('products').select('*')
  ]);
  D.settings = sRes.data || {};
  D.catalogs = cRes.data || [];
  D.products = pRes.data || [];
}

async function render() {
  const tabs = [['products', 'Products'], ['catalogs', 'Catalogs'], ['store', 'Store']];
  document.getElementById('app').innerHTML = `
    <div class="admin-bar"><div class="wrap"><b>Dew Admin</b>
      ${tabs.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" onclick="tab='${k}'; render();">${n}</button>`).join('')}
    </div></div>
    <div class="wrap" style="padding-top:18px"><div id="view"></div></div>`;
  
  if (tab === 'products') renderProducts();
  else if (tab === 'catalogs') renderCatalogs();
  else if (tab === 'store') renderStore();
}

async function renderProducts() {
  document.getElementById('view').innerHTML = `<h2>Products</h2><button class="btn" onclick="productForm()">+ New Product</button>
    <table><tr><th>Name</th><th>Price</th><th>Stock</th><th>Action</th></tr>
    ${D.products.map(p => `<tr><td>${p.name}</td><td>${p.price}</td><td>${p.stock}</td>
      <td><button onclick="productForm('${p.id}')">Edit</button> <button onclick="deleteProduct('${p.id}')">Delete</button></td></tr>`).join('')}
    </table>`;
}

async function saveProduct(p, id) {
  if (id) await supabase.from('products').update(p).eq('id', id);
  else await supabase.from('products').insert([p]);
  await loadData(); render();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await supabase.from('products').delete().eq('id', id);
  await loadData(); render();
}

function productForm(id) {
  const p = id ? D.products.find(x => x.id === id) : { name: '', price: 0, stock: 0 };
  const html = `<h2>${id ? 'Edit' : 'New'} Product</h2>
    <input id="pn" placeholder="Name" value="${p.name || ''}">
    <input id="pp" placeholder="Price" type="number" value="${p.price || 0}">
    <input id="ps" placeholder="Stock" type="number" value="${p.stock || 0}">
    <button onclick="submitProduct('${id || ''}')">Save Product</button>`;
  document.getElementById('modal').innerHTML = html;
  document.getElementById('ov').classList.add('open');
}

async function submitProduct(id) {
  const data = { name: document.getElementById('pn').value, price: document.getElementById('pp').value, stock: document.getElementById('ps').value };
  await saveProduct(data, id);
  document.getElementById('ov').classList.remove('open');
}

start();
