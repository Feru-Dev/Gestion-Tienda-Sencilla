// ═══════════════════════════════════════════
//   CREACIONES ÁGAPE — app.js
// ═══════════════════════════════════════════

let allProducts = [];
let cart = [];
let currentProduct = null;
let currentQty = 1;

// ── Load products from Google Sheets (published as CSV) ──
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const loading = document.getElementById('loadingState');

  try {
    // Acepta tanto la URL completa de publicación como solo el ID
    const url = CONFIG.SHEET_ID.startsWith('http')
      ? CONFIG.SHEET_ID
      : `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar');
    const csv = await res.text();
    allProducts = parseCSV(csv);
    renderFilters();
    renderProducts(allProducts);
  } catch (e) {
    loading.innerHTML = `
      <div style="color:var(--text-muted);padding:2rem;">
        <p style="font-size:1.5rem;margin-bottom:1rem;">⚠️</p>
        <p>No se pudieron cargar los productos.</p>
        <p style="font-size:0.8rem;margin-top:0.5rem;">Verifica que el SHEET_ID esté configurado en config.js y que la hoja esté publicada.</p>
      </div>`;
  }
}

// ── Parse CSV from Google Sheets ──
// Expected columns: nombre, descripcion, precio, categoria, imagen, disponible
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].replace(/"/g, '').split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map((line, i) => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] || '').trim(); });

    return {
      id: i + 1,
      name: obj['nombre'] || obj['name'] || 'Producto',
      desc: obj['descripcion'] || obj['description'] || obj['desc'] || '',
      price: parseFloat((obj['precio'] || obj['price'] || '0').replace(/[^0-9.]/g, '')) || 0,
      category: obj['categoria'] || obj['category'] || obj['cat'] || 'General',
      image: obj['imagen'] || obj['image'] || obj['img'] || '',
      available: (obj['disponible'] || obj['available'] || 'si').toLowerCase() !== 'no',
    };
  }).filter(p => p.available);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

// ── Render category filters ──
function renderFilters() {
  const cats = ['Todos', ...new Set(allProducts.map(p => p.category))];
  const container = document.getElementById('filters');
  container.innerHTML = cats.map(cat =>
    `<button class="filter-btn ${cat === 'Todos' ? 'active' : ''}" data-cat="${cat}" onclick="filterProducts('${cat}')">${cat}</button>`
  ).join('');
}

function filterProducts(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  const filtered = cat === 'Todos' ? allProducts : allProducts.filter(p => p.category === cat);
  renderProducts(filtered);
}

// ── Render product cards ──
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h4>No hay productos en esta categoría</h4><p>Vuelve pronto ✦</p></div>`;
    return;
  }
  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" onclick="openModal(${p.id})" style="animation-delay:${i * 0.06}s">
      <div class="card-img-wrap" style="overflow:hidden">
        ${p.image
          ? `<img class="card-img" src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'>✦</div>'">`
          : `<div class="card-img-placeholder">✦</div>`}
      </div>
      <div class="card-body">
        <p class="card-cat">${p.category}</p>
        <h4 class="card-name">${p.name}</h4>
        <p class="card-desc">${p.desc}</p>
        <div class="card-footer">
          <span class="card-price">${CONFIG.CURRENCY}${p.price.toFixed(2)}</span>
          <button class="card-add-btn" onclick="event.stopPropagation();quickAdd(${p.id})" title="Agregar al carrito">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Quick add from card ──
function quickAdd(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  addToCart(p, 1);
}

// ── Modal ──
function openModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  currentQty = 1;

  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.desc;
  document.getElementById('modalPrice').textContent = `${CONFIG.CURRENCY}${p.price.toFixed(2)}`;
  document.getElementById('modalQty').textContent = '1';

  const imgWrap = document.getElementById('modalImg').parentElement;
  if (p.image) {
    imgWrap.innerHTML = `<img id="modalImg" src="${p.image}" alt="${p.name}" style="width:100%;height:100%;min-height:380px;object-fit:cover;display:block;" onerror="this.parentElement.innerHTML='<div class=\\'modal-img-placeholder\\'>✦</div>'">`;
  } else {
    imgWrap.innerHTML = `<div class="modal-img-placeholder">✦</div>`;
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('modalQty').textContent = currentQty;
}

function addToCartFromModal() {
  if (!currentProduct) return;
  addToCart(currentProduct, currentQty);
  closeModal();
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('modalClose').addEventListener('click', closeModal);

// ── Cart ──
function addToCart(product, qty) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ ...product, qty }); }
  updateCart();
  openCart();
  bumpCount();
}

function updateCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'block';
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `${CONFIG.CURRENCY}${total.toFixed(2)}`;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      ${item.image
        ? `<img class="ci-img" src="${item.image}" alt="${item.name}" onerror="this.outerHTML='<div class=\\'ci-placeholder\\'>✦</div>'">`
        : `<div class="ci-placeholder">✦</div>`}
      <div class="ci-info">
        <p class="ci-name">${item.name}</p>
        <p class="ci-price">${CONFIG.CURRENCY}${(item.price * item.qty).toFixed(2)}</p>
        <div class="ci-controls">
          <button onclick="changeCartQty(${item.id}, -1)">−</button>
          <span class="ci-qty">${item.qty}</span>
          <button onclick="changeCartQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');
}

function changeCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function bumpCount() {
  const el = document.getElementById('cartCount');
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

// ── Build order message ──
function buildOrderMessage() {
  const lines = cart.map(i =>
    `• ${i.name} x${i.qty} — ${CONFIG.CURRENCY}${(i.price * i.qty).toFixed(2)}`
  );
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return `Hola! Quiero hacer un pedido en ${CONFIG.STORE_NAME}:\n\n${lines.join('\n')}\n\n*Total: ${CONFIG.CURRENCY}${total.toFixed(2)}*`;
}

// ── Send via WhatsApp ──
function sendWhatsApp() {
  if (cart.length === 0) return;
  saveOrder('WhatsApp');
  const msg = encodeURIComponent(buildOrderMessage());
  // Abre WhatsApp Web en el navegador (funciona en móvil y ordenador)
  window.open(`https://web.whatsapp.com/send?phone=${CONFIG.WHATSAPP}&text=${msg}`, '_blank');
}

// ── Send via Email (Gmail Web) ──
function sendEmail() {
  if (cart.length === 0) return;
  saveOrder('Email');
  const subject = encodeURIComponent(`Pedido — ${CONFIG.STORE_NAME}`);
  const body = encodeURIComponent(buildOrderMessage());
  // Abre Gmail directamente en el navegador, sin necesitar cliente de correo
  window.open(`https://mail.google.com/mail/?view=cm&to=${CONFIG.EMAIL}&su=${subject}&body=${body}`, '_blank');
}

// ── Save order to localStorage ──
function saveOrder(via) {
  const orders = JSON.parse(localStorage.getItem('agape_orders') || '[]');
  orders.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    via,
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
  });
  localStorage.setItem('agape_orders', JSON.stringify(orders.slice(0, 200)));
}

// ── Load banner from localStorage ──
function loadBanner() {
  const banner = JSON.parse(localStorage.getItem('agape_banner') || '{}');
  if (!banner.active || !banner.text) return;
  const el = document.getElementById('storeBanner');
  if (!el) return;
  el.innerHTML = `<span>${banner.text}</span><button class="banner-close" onclick="this.parentElement.style.display='none'">✕</button>`;
  el.style.display = 'block';
}

// ── Update contact links in HTML ──
function updateContactLinks() {
  const wa = document.getElementById('contactWhatsapp');
  const em = document.getElementById('contactEmail');
  if (wa) wa.href = `https://wa.me/${CONFIG.WHATSAPP}`;
  if (em) em.href = `mailto:${CONFIG.EMAIL}`;
}

// ── Init ──
updateContactLinks();
loadBanner();
loadProducts();
