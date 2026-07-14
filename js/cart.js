const URBANWEAR_CART_KEY = "urbanwear-cart-v2";
const URBANWEAR_CART_META_KEY = "urbanwear-cart-meta-v2";
const URBANWEAR_CART_ITEMS_KEY = "urbanwear-cart-items-v2";

function readCartValue(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function getCart() { return readCartValue(URBANWEAR_CART_KEY, {}); }
function getCartMeta() { return readCartValue(URBANWEAR_CART_META_KEY, {}); }

function saveCart(cart) {
  localStorage.setItem(URBANWEAR_CART_KEY, JSON.stringify(cart));
  syncCartItems();
  updateCartBadge();
}
function saveCartMeta(meta) {
  localStorage.setItem(URBANWEAR_CART_META_KEY, JSON.stringify(meta));
  syncCartItems();
}

function syncCartItems() {
  if (typeof products === "undefined") return;
  const cart = getCart();
  const meta = getCartMeta();
  const items = Object.entries(cart).filter(([slug]) => products?.[slug]).map(([slug, quantity]) => ({
    product_id: products[slug].id,
    name: products[slug].title,
    slug,
    image: products[slug].images?.[0] || "",
    selected_size: meta[slug]?.size || "",
    quantity: Number(quantity),
    price: products[slug].priceValue,
  }));
  localStorage.setItem(URBANWEAR_CART_ITEMS_KEY, JSON.stringify(items));
}

function getAvailableStock(productId, size) {
  return Number(products?.[productId]?.sizeStock?.[size] || 0);
}

function addToCart(productId, quantity = 1, options = {}) {
  const product = products?.[productId];
  const size = String(options.size || "").trim();
  if (!product) return { ok: false, error: "Товар не знайдено." };
  if (!size) return { ok: false, error: "Спочатку оберіть розмір." };
  const available = getAvailableStock(productId, size);
  if (!available) return { ok: false, error: "Обраного розміру немає в наявності." };
  const cart = getCart();
  const meta = getCartMeta();
  const nextQuantity = Math.min(available, Number(cart[productId] || 0) + Math.max(1, Number(quantity || 1)));
  cart[productId] = nextQuantity;
  meta[productId] = { size };
  saveCart(cart);
  saveCartMeta(meta);
  window.UrbanWearAnalytics?.track("cart-add", { productId, quantity: nextQuantity });
  return { ok: true };
}

function updateCartItem(productId, quantity) {
  const cart = getCart();
  const meta = getCartMeta();
  const size = meta[productId]?.size;
  if (Number(quantity) < 1) {
    delete cart[productId];
    delete meta[productId];
  } else {
    cart[productId] = Math.min(Math.max(1, Number(quantity)), getAvailableStock(productId, size));
  }
  saveCart(cart);
  saveCartMeta(meta);
}

function updateCartOptions(productId, options = {}) {
  const meta = getCartMeta();
  meta[productId] = { ...(meta[productId] || {}), ...options };
  saveCartMeta(meta);
  const cart = getCart();
  if (cart[productId]) updateCartItem(productId, cart[productId]);
}

function clearCart() { saveCart({}); saveCartMeta({}); }
function getCartCount() { return Object.values(getCart()).reduce((sum, quantity) => sum + Number(quantity || 0), 0); }
function parsePrice(price) { return Number(String(price || "").replace(/[^\d]/g, "") || 0); }
function formatPrice(value) { return `${Number(value || 0).toLocaleString("uk-UA")} грн`; }
function escapeCartHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function getPrimaryCartImage(product) { return product?.images?.filter(Boolean)?.[0] || ""; }
function createCartImageStyle(product) {
  const image = getPrimaryCartImage(product);
  return image ? `background-image:url('${escapeCartHtml(image)}')` : `--product-bg:${escapeCartHtml(product.visual)}`;
}
function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((badge) => { badge.textContent = String(getCartCount()); });
}

function getCartRows() {
  const meta = getCartMeta();
  return Object.entries(getCart()).filter(([slug]) => products?.[slug]).map(([slug, quantity]) => ({
    productId: slug,
    product: products[slug],
    quantity: Number(quantity),
    options: meta[slug] || {},
    subtotal: products[slug].priceValue * Number(quantity),
  }));
}

function renderCartPage() {
  const target = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton");
  const clearButton = document.getElementById("clearCartButton");
  if (!target || !total) return updateCartBadge();
  const rows = getCartRows();
  if (!rows.length) {
    target.innerHTML = '<div class="cart-empty"><h2>Кошик поки порожній</h2><p>Додайте товари з каталогу.</p><a class="btn btn--dark" href="catalog.html">До каталогу</a></div>';
    total.textContent = "0 грн";
    checkoutButton?.classList.add("is-disabled");
    if (clearButton) clearButton.disabled = true;
    return;
  }
  target.innerHTML = rows.map((row) => `<article class="cart-item">
    <div class="cart-item__visual ${getPrimaryCartImage(row.product) ? "cart-item__visual--photo" : ""}" style="${createCartImageStyle(row.product)}"><span>${escapeCartHtml(row.product.imageLabel)}</span></div>
    <div><h3>${escapeCartHtml(row.product.title)}</h3><p>Розмір: ${escapeCartHtml(row.options.size)}</p><strong>${escapeCartHtml(row.product.price)}</strong></div>
    <div class="cart-item__controls"><input type="number" min="1" max="${getAvailableStock(row.productId, row.options.size)}" value="${row.quantity}" data-cart-quantity="${row.productId}" aria-label="Кількість" /><button type="button" data-cart-remove="${row.productId}">Видалити</button></div>
  </article>`).join("");
  total.textContent = formatPrice(rows.reduce((sum, row) => sum + row.subtotal, 0));
  checkoutButton?.classList.remove("is-disabled");
  if (clearButton) clearButton.disabled = false;
}

function selectedSize() { return document.querySelector(".size-list button.is-active:not(:disabled)")?.dataset.size || ""; }
function showCartError(message) {
  const note = document.querySelector(".product-note");
  if (note) note.textContent = message;
  else window.alert(message);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  window.UrbanWearStore.ready.then(renderCartPage).catch(() => updateCartBadge());
  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-to-cart]");
    const buy = event.target.closest("[data-buy-now]");
    const remove = event.target.closest("[data-cart-remove]");
    if (event.target.closest("#checkoutButton.is-disabled")) event.preventDefault();
    if (add || buy) {
      const button = add || buy;
      if (add && (add.closest(".product-card") || !document.querySelector(".size-list"))) {
        window.location.href = `product.html?slug=${encodeURIComponent(button.dataset.addToCart)}`;
        return;
      }
      const result = addToCart(button.dataset.addToCart || button.dataset.buyNow, 1, { size: selectedSize() });
      if (!result.ok) return showCartError(result.error);
      if (buy) window.location.href = "account.html?tab=cart";
      else {
        const initial = button.dataset.defaultText || "До кошика";
        button.textContent = "Додано";
        setTimeout(() => { button.textContent = initial; }, 1000);
      }
    }
    if (remove) { updateCartItem(remove.dataset.cartRemove, 0); renderCartPage(); }
  });
  document.addEventListener("input", (event) => {
    if (!event.target.matches("[data-cart-quantity]")) return;
    updateCartItem(event.target.dataset.cartQuantity, Number(event.target.value));
    renderCartPage();
  });
});

window.UrbanWearCart = {
  getCart, getCartMeta, getCartRows, addToCart, updateCartItem, updateCartOptions,
  clearCart, getCartCount, renderCartPage,
  syncCartItems,
};
