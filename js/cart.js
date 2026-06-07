const URBANWEAR_CART_KEY = "urbanwear-cart";
const URBANWEAR_CART_META_KEY = "urbanwear-cart-meta";

function getCart() {
  try { return JSON.parse(localStorage.getItem(URBANWEAR_CART_KEY) || "{}"); }
  catch (error) { return {}; }
}

function getCartMeta() {
  try { return JSON.parse(localStorage.getItem(URBANWEAR_CART_META_KEY) || "{}"); }
  catch (error) { return {}; }
}

function saveCart(cart) {
  localStorage.setItem(URBANWEAR_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function saveCartMeta(meta) {
  localStorage.setItem(URBANWEAR_CART_META_KEY, JSON.stringify(meta));
}

function addToCart(productId, quantity = 1, options = {}) {
  const cart = getCart();
  const meta = getCartMeta();
  cart[productId] = (cart[productId] || 0) + quantity;
  meta[productId] = { ...(meta[productId] || {}), ...options };
  saveCart(cart);
  saveCartMeta(meta);
  window.UrbanWearAnalytics?.track("cart-add", { productId, quantity });
}

function updateCartItem(productId, quantity) {
  const cart = getCart();
  const meta = getCartMeta();
  if (quantity <= 0) {
    delete cart[productId];
    delete meta[productId];
  } else {
    cart[productId] = quantity;
  }
  saveCart(cart);
  saveCartMeta(meta);
}

function updateCartOptions(productId, options = {}) {
  const meta = getCartMeta();
  meta[productId] = { ...(meta[productId] || {}), ...options };
  saveCartMeta(meta);
}

function clearCart() {
  saveCart({});
  saveCartMeta({});
}

function getCartCount() {
  return Object.values(getCart()).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
}

function parsePrice(price) {
  return Number(String(price || "").replace(/[^\d]/g, "") || 0);
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function escapeCartHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getPrimaryCartImage(product) {
  return Array.isArray(product?.images) ? product.images.filter(Boolean)[0] || "" : "";
}

function createCartImageStyle(product) {
  const image = getPrimaryCartImage(product);
  return image ? `background-image:url('${escapeCartHtml(image)}')` : `--product-bg:${escapeCartHtml(product.visual)}`;
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(getCartCount());
  });
}

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton");
  const clearButton = document.getElementById("clearCartButton");
  if (!cartItems || !cartTotal || typeof products === "undefined") {
    updateCartBadge();
    return;
  }

  const meta = getCartMeta();
  const rows = Object.entries(getCart())
    .filter(([productId]) => products[productId])
    .map(([productId, quantity]) => ({
      productId,
      product: products[productId],
      quantity: Number(quantity),
      options: meta[productId] || {},
      subtotal: parsePrice(products[productId].price) * Number(quantity),
    }));

  if (!rows.length) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <h2>Кошик поки порожній</h2>
        <p>Додайте товари з каталогу, щоб перейти до оформлення замовлення.</p>
        <a class="btn btn--dark" href="catalog.html">До каталогу</a>
      </div>`;
    cartTotal.textContent = "0 грн";
    checkoutButton.classList.add("is-disabled");
    checkoutButton.setAttribute("aria-disabled", "true");
    clearButton.disabled = true;
    return;
  }

  cartItems.innerHTML = rows.map((row) => `
    <article class="cart-item">
      <div class="cart-item__visual ${getPrimaryCartImage(row.product) ? "cart-item__visual--photo" : ""}" style="${createCartImageStyle(row.product)}">
        <span>${escapeCartHtml(row.product.imageLabel)}</span>
      </div>
      <div>
        <h3>${escapeCartHtml(row.product.title)}</h3>
        <p>${escapeCartHtml(row.product.shortDescription)}</p>
        ${row.options.size ? `<p>Розмір: ${escapeCartHtml(row.options.size)}</p>` : ""}
        <strong>${escapeCartHtml(row.product.price)}</strong>
      </div>
      <div class="cart-item__controls">
        <input type="number" min="1" value="${row.quantity}" data-cart-quantity="${row.productId}" aria-label="Кількість" />
        <button type="button" data-cart-remove="${row.productId}">Видалити</button>
      </div>
    </article>`).join("");

  cartTotal.textContent = formatPrice(rows.reduce((sum, row) => sum + row.subtotal, 0));
  checkoutButton.classList.remove("is-disabled");
  checkoutButton.removeAttribute("aria-disabled");
  clearButton.disabled = false;
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartPage();
  document.addEventListener("click", (event) => {
    const checkoutLink = event.target.closest("#checkoutButton.is-disabled");
    const addButton = event.target.closest("[data-add-to-cart]");
    const buyButton = event.target.closest("[data-buy-now]");
    const removeButton = event.target.closest("[data-cart-remove]");
    if (checkoutLink) event.preventDefault();
    if (addButton) {
      const activeSize = document.querySelector(".size-list button.is-active")?.textContent.trim();
      addToCart(addButton.dataset.addToCart, 1, activeSize ? { size: activeSize } : {});
      const initialText = addButton.dataset.defaultText || "До кошика";
      addButton.textContent = "Додано";
      setTimeout(() => { addButton.textContent = initialText; }, 1200);
    }
    if (buyButton) {
      const activeSize = document.querySelector(".size-list button.is-active")?.textContent.trim();
      addToCart(buyButton.dataset.buyNow, 1, activeSize ? { size: activeSize } : {});
      window.location.href = "account.html?tab=cart";
    }
    if (removeButton) {
      updateCartItem(removeButton.dataset.cartRemove, 0);
      renderCartPage();
    }
  });
  document.addEventListener("input", (event) => {
    if (!event.target.matches("[data-cart-quantity]")) return;
    updateCartItem(event.target.dataset.cartQuantity, Number(event.target.value));
    renderCartPage();
  });
});

window.UrbanWearCart = {
  getCart, getCartMeta, addToCart, updateCartItem, updateCartOptions, clearCart, getCartCount, renderCartPage,
};
