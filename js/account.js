window.UrbanWearStore.ready.then(() => {
const accountShell = document.getElementById("accountShell");
const savedAccountSession = window.UrbanWearAuth.getSession();
const isGuestAccount = !savedAccountSession || savedAccountSession.role !== "customer";
const accountSession = isGuestAccount
  ? { role: "guest", name: "Гість", email: "" }
  : savedAccountSession;
let activeDrawerOrder = null;
let accountProfile = window.UrbanWearProfile.getProfile(accountSession);

const accountStatusLabels = {
  New: ["В обробці", "is-processing"],
  Processing: ["В обробці", "is-processing"],
  Shipped: ["Відправлено", "is-shipped"],
  Completed: ["Доставлено", "is-completed"],
  Cancelled: ["Скасовано", "is-cancelled"],
};

function escapeAccountHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function accountPrice(value) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function accountDate(value) {
  return new Date(value).toLocaleString("uk-UA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function productImageStyle(product, fallback = "") {
  const image = product?.images?.filter(Boolean)?.[0] || fallback;
  return image ? `background-image:url('${escapeAccountHtml(image)}')` : `--product-bg:${escapeAccountHtml(product?.visual || "#d8d4ce")}`;
}

function productSizes(product) {
  if (Array.isArray(product?.sizes) && product.sizes.length) return product.sizes;
  return product?.category === "accessories" ? ["Універсальний"] : ["S", "M", "L", "XL"];
}

function productColor(product) {
  const colorSpec = (product?.specs || []).find((spec) => String(spec).toLowerCase().startsWith("колір:"));
  return colorSpec ? colorSpec.split(":").slice(1).join(":").trim() : "Базовий";
}

function productColorValue(product) {
  const color = productColor(product).toLowerCase();
  if (color.includes("бі")) return "#f6f5f1";
  if (color.includes("граф")) return "#686868";
  if (color.includes("сір")) return "#aaa9a5";
  return "#111";
}

function accountCartRows() {
  const cart = window.UrbanWearCart.getCart();
  const meta = window.UrbanWearCart.getCartMeta();
  return Object.entries(cart)
    .filter(([id]) => products[id])
    .map(([id, quantity]) => ({ id, product: products[id], quantity: Number(quantity), options: meta[id] || {} }));
}

function customerOrders() {
  if (!accountSession) return [];
  const accountEmails = new Set([accountSession.email, accountProfile?.email].filter(Boolean).map((email) => email.toLowerCase()));
  return window.UrbanWearOrders.getOrders().filter((order) => accountEmails.has(order.customer?.email?.toLowerCase()));
}

function fillProfileForm() {
  const form = document.getElementById("accountProfileForm");
  Object.entries(accountProfile).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value || "";
  });
  renderProfileContactSummary();
}

function collectProfileForm() {
  const form = document.getElementById("accountProfileForm");
  const data = new FormData(form);
  return {
    firstName: String(data.get("firstName") || "").trim(),
    lastName: String(data.get("lastName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    city: String(data.get("city") || "").trim(),
    address: String(data.get("address") || "").trim(),
    deliveryComment: String(data.get("deliveryComment") || "").trim(),
    useAsDefault: data.has("useAsDefault"),
    autofillPersonalData: data.has("autofillPersonalData"),
    defaultAddressEnabled: data.has("defaultAddressEnabled"),
    defaultPaymentEnabled: data.has("defaultPaymentEnabled"),
  };
}

function renderProfileContactSummary() {
  const fullAddress = [accountProfile.address, accountProfile.city].filter(Boolean).join(", ") || "Адресу не вказано";
  document.getElementById("profileContactSummary").innerHTML = `
    <div class="customer-profile-contact-row"><strong>✉</strong><span>${escapeAccountHtml(accountProfile.email || "Email не вказано")}</span></div>
    <div class="customer-profile-contact-row"><strong>⌕</strong><span>${escapeAccountHtml(accountProfile.phone || "Телефон не вказано")}</span></div>
    <div class="customer-profile-contact-row"><strong>⌖</strong><span>${escapeAccountHtml(fullAddress)}</span></div>`;
}

function saveAccountProfile(event) {
  event.preventDefault();
  accountProfile = window.UrbanWearProfile.saveProfile(accountSession, collectProfileForm());
  fillProfileForm();
  const message = document.getElementById("profileSaveMessage");
  message.textContent = "Зміни збережено";
  setTimeout(() => { message.textContent = ""; }, 2500);
  renderAccountIdentity();
}

function renderAccountIdentity() {
  const firstName = accountProfile.firstName || accountSession.name.split(" ")[0] || "Гість";
  const fullName = [accountProfile.firstName, accountProfile.lastName].filter(Boolean).join(" ") || accountSession.name;
  document.getElementById("accountName").textContent = fullName;
  document.getElementById("accountEmail").textContent = accountProfile.email || accountSession.email;
  document.getElementById("accountAvatar").textContent = firstName.slice(0, 1).toUpperCase();
  document.getElementById("accountTopName").textContent = firstName;
  document.getElementById("accountGreeting").textContent = isGuestAccount
    ? "Кошик і обране доступні без авторизації."
    : `Вітаємо, ${firstName}! Раді вас бачити знову.`;
}

function orderStatus(order) {
  const [label, className] = accountStatusLabels[order.status] || [order.status, "is-processing"];
  return `<span class="customer-status ${className}">${label}</span>`;
}

function orderItemsCount(order) {
  return (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function orderPreview(order) {
  const item = order.items?.[0] || {};
  const product = products[item.id] || {};
  return `<div class="customer-order-preview"><span class="customer-product-image" style="${productImageStyle(product, item.image)}">${escapeAccountHtml(product.imageLabel || "")}</span><span><strong>${escapeAccountHtml(order.number)}</strong><small>${accountDate(order.createdAt)}</small></span></div>`;
}

function renderSummary() {
  const orders = customerOrders();
  const processing = orders.filter((order) => ["New", "Processing"].includes(order.status)).length;
  const completed = orders.filter((order) => order.status === "Completed").length;
  const active = orders.filter((order) => !["Completed", "Cancelled"].includes(order.status)).length;
  const bagIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9h12l1 12H5zM9 10V7a3 3 0 0 1 6 0v3"/></svg>';
  document.getElementById("accountSummary").innerHTML = [
    [bagIcon, "Активні замовлення", active],
    ["◷", "В обробці", processing],
    ["✓", "Завершені замовлення", completed],
  ].map(([icon, title, value]) => `<article class="customer-summary-card"><span class="customer-summary-card__icon">${icon}</span><div><span>${title}</span><strong>${value}</strong><small>Переглянути замовлення</small></div><button type="button" data-account-tab-link="orders">→</button></article>`).join("");
}

function recentOrdersTable() {
  const orders = customerOrders().slice(0, 5);
  const target = document.getElementById("recentAccountOrders");
  target.innerHTML = orders.length ? `<table class="customer-orders-table"><tbody>${orders.map((order) => `<tr>
    <td>${orderPreview(order)}</td><td>${orderItemsCount(order)} товарів</td><td>${orderStatus(order)}</td><td><strong>${accountPrice(order.total)}</strong></td>
    <td><div class="customer-row-actions"><button type="button" data-order-details="${escapeAccountHtml(order.id)}">Деталі</button></div></td></tr>`).join("")}</tbody></table>`
    : '<div class="customer-empty"><strong>Замовлень поки немає</strong><p>Після оформлення покупки замовлення з’являться тут.</p><a class="btn btn--dark" href="catalog.html">Перейти до каталогу</a></div>';
}

function renderAccountCart() {
  const rows = accountCartRows();
  const target = document.getElementById("accountCart");
  if (!rows.length) {
    target.innerHTML = '<div class="customer-empty"><strong>Ваш кошик порожній</strong><p>Додайте товари з каталогу, щоб оформити замовлення.</p><a class="btn btn--dark" href="catalog.html">Перейти до каталогу</a></div>';
    return;
  }
  const subtotal = rows.reduce((sum, row) => sum + parsePrice(row.product.price) * row.quantity, 0);
  const promo = "";
  const discount = 0;
  const delivery = 0;
  const total = subtotal - discount + delivery;
  target.innerHTML = `<div class="customer-cart-table-wrap"><table class="customer-cart-table customer-cart-table--premium"><thead><tr><th>Товар</th><th>Розмір</th><th>Колір</th><th>Ціна</th><th>Кількість</th><th>Сума</th><th>Дія</th></tr></thead><tbody>${rows.map((row) => `<tr>
    <td><div class="customer-order-preview"><span class="customer-product-image" style="${productImageStyle(row.product)}">${escapeAccountHtml(row.product.imageLabel)}</span><span><strong>${escapeAccountHtml(row.product.title)}</strong><small>SKU: ${escapeAccountHtml(row.id)}</small></span></div></td>
    <td><select data-account-cart-size="${escapeAccountHtml(row.id)}" aria-label="Розмір ${escapeAccountHtml(row.product.title)}">${productSizes(row.product).map((size) => `<option ${size === (row.options.size || productSizes(row.product)[0]) ? "selected" : ""}>${escapeAccountHtml(size)}</option>`).join("")}</select></td>
    <td><span class="customer-color"><i style="background:${productColorValue(row.product)}"></i>${escapeAccountHtml(productColor(row.product))}</span></td><td>${escapeAccountHtml(row.product.price)}</td>
    <td><div class="customer-quantity"><button type="button" data-account-cart-step="${escapeAccountHtml(row.id)}" data-step="-1">−</button><strong>${row.quantity}</strong><button type="button" data-account-cart-step="${escapeAccountHtml(row.id)}" data-step="1">+</button></div></td>
    <td><strong>${accountPrice(parsePrice(row.product.price) * row.quantity)}</strong></td><td><button class="customer-delete-button" type="button" data-account-cart-remove="${escapeAccountHtml(row.id)}">Видалити</button></td></tr>`).join("")}</tbody></table></div>
    <div class="customer-cart-bottom">
      <div class="customer-cart-tools"><button type="button" id="accountClearCart">Очистити кошик</button><div class="customer-cart-info">Розмір та кількість товарів можна змінити до оформлення замовлення.</div></div>
      <div class="customer-cart-info">Сума замовлення остаточно перевіряється сервером за актуальними цінами.</div>
      <div class="customer-cart-summary"><p><span>Проміжний підсумок</span><strong>${accountPrice(subtotal)}</strong></p>${discount ? `<p><span>Знижка</span><strong>− ${accountPrice(discount)}</strong></p>` : ""}<p><span>Доставка</span><strong>${delivery ? accountPrice(delivery) : "Безкоштовно"}</strong></p><p class="is-total"><span>Разом</span><strong>${accountPrice(total)}</strong></p><a class="btn customer-checkout-button" href="checkout.html">Оформити замовлення →</a><a class="btn btn--light" href="catalog.html">Продовжити покупки</a></div>
    </div>`;
}

function renderFavorites() {
  const target = document.getElementById("accountFavorites");
  const favorites = window.UrbanWearFavorites.getFavorites().filter((id) => products[id]);
  if (!favorites.length) {
    target.innerHTML = '<div class="customer-empty"><strong>Обране поки порожнє</strong><p>Додавайте товари, які хочете переглянути пізніше.</p><a class="btn btn--dark" href="catalog.html">Перейти до каталогу</a></div>';
    return;
  }
  target.innerHTML = `<div class="customer-favorites-grid">${favorites.map((id) => {
    const product = products[id];
    return `<article class="customer-favorite-product"><div class="customer-favorite-image" style="${productImageStyle(product)}"><button class="customer-favorite-remove" type="button" data-favorite-product="${escapeAccountHtml(id)}">Видалити</button><span>${escapeAccountHtml(product.imageLabel)}</span></div><div class="customer-favorite-body"><h2>${escapeAccountHtml(product.title)}</h2><small>SKU: ${escapeAccountHtml(id)}</small><div class="customer-favorite-swatches"><i style="background:${productColorValue(product)}"></i><i></i><i></i></div><strong>${escapeAccountHtml(product.price)}</strong><button class="btn btn--dark" type="button" data-add-to-cart="${escapeAccountHtml(id)}" data-default-text="Додати в кошик">Додати в кошик</button><a class="btn btn--light" href="product.html?slug=${encodeURIComponent(id)}">Переглянути товар</a></div></article>`;
  }).join("")}</div>`;
  window.UrbanWearFavorites.updateFavoritesUI();
}

function renderOrders() {
  const orders = customerOrders();
  const target = document.getElementById("accountOrders");
  if (!orders.length) {
    target.innerHTML = '<div class="customer-empty"><strong>Активних замовлень поки немає</strong><p>Після оформлення покупки замовлення з’являться тут.</p></div>';
    return;
  }
  target.innerHTML = `<table class="customer-orders-table"><thead><tr><th>Замовлення</th><th>Дата</th><th>Статус</th><th>Товари</th><th>Сума</th><th>Дія</th></tr></thead><tbody>${orders.map((order) => `<tr>
    <td><strong>${escapeAccountHtml(order.number)}</strong></td><td>${new Date(order.createdAt).toLocaleDateString("uk-UA")}</td><td>${orderStatus(order)}</td><td>${orderItemsCount(order)} товарів</td><td><strong>${accountPrice(order.total)}</strong></td>
    <td><div class="customer-row-actions"><button type="button" data-order-details="${escapeAccountHtml(order.id)}">Деталі</button>${order.delivery?.trackingNumber ? `<button type="button" data-track-order="${escapeAccountHtml(order.id)}">Відстежити</button>` : ""}${order.status === "Completed" ? `<button type="button" data-repeat-order="${escapeAccountHtml(order.id)}">Повторити замовлення</button>` : ""}</div></td></tr>`).join("")}</tbody></table>`;
}

function openOrderDrawer(orderId) {
  const order = customerOrders().find((entry) => entry.id === orderId);
  if (!order) return;
  activeDrawerOrder = order;
  document.getElementById("drawerOrderNumber").textContent = order.number;
  document.getElementById("accountOrderDetails").innerHTML = `
    <section class="customer-order-detail-section"><h3>Статус і дата</h3>${orderStatus(order)}<p>${accountDate(order.createdAt)}</p></section>
    <section class="customer-order-detail-section"><h3>Покупець</h3><p>${escapeAccountHtml(order.customer.name)}</p><p>${escapeAccountHtml(order.customer.email || "")}</p><p>${escapeAccountHtml(order.customer.phone || "")}</p></section>
    <section class="customer-order-detail-section"><h3>Доставка й оплата</h3><p>${escapeAccountHtml(order.delivery.method)}</p><p>${escapeAccountHtml([order.delivery.city, order.delivery.branch].filter(Boolean).join(", "))}</p>${order.delivery.comment ? `<p>Коментар: ${escapeAccountHtml(order.delivery.comment)}</p>` : ""}<p>${escapeAccountHtml(order.payment.method)}</p></section>
    <section class="customer-order-detail-section"><h3>Товари</h3>${order.items.map((item) => `<div class="customer-order-detail-item"><span>${escapeAccountHtml(item.title)}${item.size ? ` · ${escapeAccountHtml(item.size)}` : ""} × ${item.quantity}</span><strong>${accountPrice(item.price * item.quantity)}</strong></div>`).join("")}<div class="customer-order-detail-item"><strong>Разом</strong><strong>${accountPrice(order.total)}</strong></div></section>`;
  document.getElementById("repeatOrderButton").hidden = order.status !== "Completed";
  document.getElementById("accountOrderBackdrop").hidden = false;
  document.getElementById("accountOrderDrawer").classList.add("is-open");
  document.getElementById("accountOrderDrawer").setAttribute("aria-hidden", "false");
}

function closeOrderDrawer() {
  document.getElementById("accountOrderDrawer").classList.remove("is-open");
  document.getElementById("accountOrderDrawer").setAttribute("aria-hidden", "true");
  document.getElementById("accountOrderBackdrop").hidden = true;
}

function repeatOrder(order) {
  if (!order) return;
  order.items.forEach((item) => window.UrbanWearCart.addToCart(item.id, item.quantity, item.size ? { size: item.size } : {}));
  renderAccountCart();
  activateAccountTab("orders");
  closeOrderDrawer();
}

function activateAccountTab(name) {
  document.querySelectorAll("[data-account-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.accountPanel === name));
  document.querySelectorAll("[data-account-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.accountTab === name));
  document.getElementById("accountSidebar").classList.remove("is-open");
  history.replaceState(null, "", `account.html?tab=${encodeURIComponent(name)}`);
  if (name === "orders") renderOrders();
  if (name === "cart") renderAccountCart();
  if (name === "favorites") renderFavorites();
}

function renderAccount() {
  renderAccountIdentity();
  if (!isGuestAccount) fillProfileForm();
  renderSummary(); recentOrdersTable(); renderAccountCart(); renderFavorites(); renderOrders();
}

function logoutAccount() {
  if (isGuestAccount) window.location.href = "auth.html";
  else { window.UrbanWearAuth.logout(); window.location.href = "index.html"; }
}

function prepareGuestAccount() {
  if (!isGuestAccount) return;
  document.querySelectorAll('[data-account-tab]:not([data-account-tab="cart"]):not([data-account-tab="favorites"])').forEach((button) => {
    button.hidden = true;
  });
  document.querySelectorAll('[data-account-panel]:not([data-account-panel="cart"]):not([data-account-panel="favorites"])').forEach((panel) => {
    panel.hidden = true;
  });
  document.querySelector(".customer-news-card").hidden = true;
  document.getElementById("accountLogoutButton").textContent = "Увійти";
  document.getElementById("accountLogoutSettingsButton").hidden = true;
  document.querySelector('[data-account-tab-link="profile"]').hidden = true;
}

accountShell.hidden = false;
prepareGuestAccount();
renderAccount();
if (!isGuestAccount) {
  Promise.all([
    window.UrbanWearProfile.syncProfile(accountSession),
    window.UrbanWearOrders.syncOrders(),
  ]).then(([profile]) => {
    accountProfile = profile;
    renderAccount();
  }).catch(() => {});
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-account-tab], [data-account-tab-link]");
  const details = event.target.closest("[data-order-details]");
  const repeat = event.target.closest("[data-repeat-order]");
  const track = event.target.closest("[data-track-order]");
  const remove = event.target.closest("[data-account-cart-remove]");
  const step = event.target.closest("[data-account-cart-step]");
  if (tab) activateAccountTab(tab.dataset.accountTab || tab.dataset.accountTabLink);
  if (details) openOrderDrawer(details.dataset.orderDetails);
  if (repeat) repeatOrder(customerOrders().find((order) => order.id === repeat.dataset.repeatOrder));
  if (track) {
    window.UrbanWearStore.api(`/api/account/orders/${encodeURIComponent(track.dataset.trackOrder)}/tracking`, {
      headers: window.UrbanWearAuth.customerHeaders(),
    }).then((result) => {
      const order = window.UrbanWearOrders.mapApiOrder(result.order);
      window.UrbanWearOrders.saveOrders([order, ...window.UrbanWearOrders.getOrders().filter((entry) => entry.id !== order.id)]);
      renderOrders();
      alert(result.tracking?.Status || result.order.tracking_status || "Статус оновлено.");
    }).catch((error) => alert(error.message));
  }
  if (remove) { window.UrbanWearCart.updateCartItem(remove.dataset.accountCartRemove, 0); renderAccountCart(); }
  if (step) {
    const row = accountCartRows().find((item) => item.id === step.dataset.accountCartStep);
    if (row) window.UrbanWearCart.updateCartItem(row.id, row.quantity + Number(step.dataset.step));
    renderAccountCart();
  }
  if (event.target.closest("#accountClearCart")) { window.UrbanWearCart.clearCart(); renderAccountCart(); }
  if (event.target.closest("#clearFavoritesButton")) { window.UrbanWearFavorites.clearFavorites(); renderFavorites(); }
});
document.addEventListener("input", (event) => {
  if (event.target.matches("[data-account-cart-size]")) window.UrbanWearCart.updateCartOptions(event.target.dataset.accountCartSize, { size: event.target.value });
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-account-cart-size]")) window.UrbanWearCart.updateCartOptions(event.target.dataset.accountCartSize, { size: event.target.value });
});
document.addEventListener("submit", (event) => {
  if (!event.target.matches("#accountPromoForm")) return;
  event.preventDefault();
  const promo = String(new FormData(event.target).get("promo") || "").trim().toUpperCase();
  const message = document.getElementById("accountPromoMessage");
  if (["URBAN10", "WELCOME5", "FREEDELIVERY"].includes(promo)) {
    localStorage.setItem("urbanwear-promo", promo);
    renderAccountCart();
    document.getElementById("accountPromoMessage").textContent = "Промокод застосовано";
  } else {
    message.textContent = "Промокод не знайдено";
  }
});
document.addEventListener("urbanwear:favorites-changed", renderFavorites);
document.getElementById("accountSearch").addEventListener("keydown", (event) => { if (event.key === "Enter" && event.target.value.trim()) window.location.href = `catalog.html?search=${encodeURIComponent(event.target.value.trim())}`; });
document.getElementById("accountMenuButton").addEventListener("click", () => document.getElementById("accountSidebar").classList.toggle("is-open"));
document.getElementById("accountLogoutButton").addEventListener("click", logoutAccount);
document.getElementById("accountLogoutSettingsButton").addEventListener("click", logoutAccount);
document.getElementById("closeOrderDrawer").addEventListener("click", closeOrderDrawer);
document.getElementById("closeOrderDrawerBottom").addEventListener("click", closeOrderDrawer);
document.getElementById("accountOrderBackdrop").addEventListener("click", closeOrderDrawer);
document.getElementById("repeatOrderButton").addEventListener("click", () => repeatOrder(activeDrawerOrder));
document.getElementById("accountProfileForm").addEventListener("submit", saveAccountProfile);
document.getElementById("customerPasswordForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = document.getElementById("customerPasswordMessage");
  if (data.get("new_password") !== data.get("confirm_password")) {
    message.textContent = "Нові паролі не збігаються.";
    return;
  }
  try {
    const result = await window.UrbanWearStore.api("/api/account/password", {
      method: "PATCH",
      headers: window.UrbanWearAuth.customerHeaders(),
      body: JSON.stringify({
        current_password: data.get("current_password"),
        new_password: data.get("new_password"),
      }),
    });
    message.textContent = result.message;
    event.currentTarget.reset();
    window.UrbanWearAuth.logout();
    setTimeout(() => { window.location.href = "auth.html"; }, 900);
  } catch (error) {
    message.textContent = error.message;
  }
});
document.getElementById("cancelProfileChanges").addEventListener("click", () => {
  accountProfile = window.UrbanWearProfile.getProfile(accountSession);
  fillProfileForm();
  document.getElementById("profileSaveMessage").textContent = "";
});

const requestedTab = new URLSearchParams(window.location.search).get("tab");
const allowedRequestedTab = isGuestAccount && !["cart", "favorites"].includes(requestedTab) ? "cart" : requestedTab;
if (allowedRequestedTab && document.querySelector(`[data-account-panel="${CSS.escape(allowedRequestedTab)}"]`)) activateAccountTab(allowedRequestedTab);
}).catch(() => {});
