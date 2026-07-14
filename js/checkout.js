const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutSubmitButton = document.getElementById("checkoutSubmitButton");
const deliveryDynamicFields = document.getElementById("deliveryDynamicFields");
const checkoutIdempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `checkout-${Date.now()}-${Math.random()}`;
let novaCities = [];
let novaWarehouses = [];
let novaSearchTimer;
let checkoutConfig = { payment: { enabled: false }, delivery: {} };

function renderNovaOptions(listId, values) {
  const list = document.getElementById(listId);
  if (list) list.innerHTML = values.map((value) => `<option value="${escapeCartHtml(value)}"></option>`).join("");
}

async function loadNovaCities(search) {
  novaCities = await window.UrbanWearStore.api(`/api/delivery/nova-poshta/cities?search=${encodeURIComponent(search)}`);
  renderNovaOptions("novaCitiesList", novaCities.map((city) => city.name));
}

async function loadNovaWarehouses() {
  const cityInput = deliveryDynamicFields.querySelector('[name="city"]');
  const city = novaCities.find((entry) => entry.name === cityInput?.value);
  if (!city) return;
  novaWarehouses = await window.UrbanWearStore.api(`/api/delivery/nova-poshta/warehouses?city_ref=${encodeURIComponent(city.ref)}`);
  const method = checkoutForm.querySelector('input[name="delivery"]:checked')?.value;
  const names = novaWarehouses
    .filter((warehouse) => method === "postomat" ? /поштомат|postomat/i.test(warehouse.category) : !/поштомат|postomat/i.test(warehouse.category))
    .map((warehouse) => warehouse.name);
  renderNovaOptions("novaWarehousesList", names);
}

function setupNovaPoshtaFields() {
  const cityInput = deliveryDynamicFields.querySelector('[name="city"]');
  const officeInput = deliveryDynamicFields.querySelector('[name="office"]');
  const method = checkoutForm.querySelector('input[name="delivery"]:checked')?.value;
  if (!cityInput) return;
  cityInput.addEventListener("input", () => {
    clearTimeout(novaSearchTimer);
    if (cityInput.value.trim().length < 2) return;
    novaSearchTimer = setTimeout(() => loadNovaCities(cityInput.value.trim()).catch(() => {}), 250);
  });
  if (method !== "courier") {
    cityInput.addEventListener("change", () => loadNovaWarehouses().catch(() => {}));
    officeInput?.addEventListener("focus", () => loadNovaWarehouses().catch(() => {}));
  }
}

async function loadUkrposhtaOffices() {
  const officeInput = deliveryDynamicFields.querySelector('[name="office"]');
  const postcode = String(officeInput?.value || "").match(/\b\d{5}\b/)?.[0] || "";
  if (!postcode) return;
  const offices = await window.UrbanWearStore.api(`/api/delivery/ukrposhta/offices?postcode=${encodeURIComponent(postcode)}`);
  renderNovaOptions("ukrposhtaOfficesList", offices.map((office) => `${office.postcode} — ${office.name}${office.address ? `, ${office.address}` : ""}`));
}

function setupUkrposhtaFields() {
  const officeInput = deliveryDynamicFields.querySelector('[name="office"]');
  if (!officeInput) return;
  officeInput.addEventListener("input", () => {
    clearTimeout(novaSearchTimer);
    if (!/\d{5}/.test(officeInput.value)) return;
    novaSearchTimer = setTimeout(() => loadUkrposhtaOffices().catch(() => {}), 250);
  });
}

function renderDeliveryFields() {
  const method = checkoutForm.querySelector('input[name="delivery"]:checked')?.value || "branch";
  const city = '<label>Населений пункт <input type="text" name="city" list="novaCitiesList" autocomplete="off" required /><datalist id="novaCitiesList"></datalist></label>';
  const fields = {
    branch: `${city}<label>Відділення <input type="text" name="office" list="novaWarehousesList" autocomplete="off" required /><datalist id="novaWarehousesList"></datalist></label>`,
    postomat: `${city}<label>Поштомат <input type="text" name="office" list="novaWarehousesList" autocomplete="off" required /><datalist id="novaWarehousesList"></datalist></label>`,
    courier: `${city}<label>Адреса <input type="text" name="office" required /></label>`,
    ukrposhta: '<label>Населений пункт <input type="text" name="city" autocomplete="address-level2" required /></label><label>Індекс або відділення <input type="text" name="office" list="ukrposhtaOfficesList" inputmode="numeric" autocomplete="postal-code" placeholder="Наприклад, 01001" required /><datalist id="ukrposhtaOfficesList"></datalist></label>',
  };
  deliveryDynamicFields.innerHTML = fields[method];
  if (method === "ukrposhta") setupUkrposhtaFields();
  else setupNovaPoshtaFields();
}

function renderCheckout() {
  const rows = window.UrbanWearCart.getCartRows();
  checkoutItems.innerHTML = rows.length ? rows.map((row) => `<article class="checkout-summary-item">
    <div class="checkout-summary-item__image" style="${row.product.images?.[0] ? `background-image:url('${escapeCartHtml(row.product.images[0])}')` : ""}"></div>
    <div><h3>${escapeCartHtml(row.product.title)}</h3><p>Розмір: ${escapeCartHtml(row.options.size)}</p><p>Кількість: ${row.quantity}</p></div>
    <strong>${formatPrice(row.subtotal)}</strong></article>`).join("") : "<p>Кошик порожній.</p>";
  checkoutTotal.textContent = formatPrice(rows.reduce((sum, row) => sum + row.subtotal, 0));
  checkoutSubmitButton.disabled = !rows.length;
}

async function loadCheckoutConfig() {
  checkoutConfig = await window.UrbanWearStore.api("/api/config");
  const onlineInput = document.querySelector('input[name="payment"][value="online"]');
  const hint = document.getElementById("liqpayPaymentHint");
  onlineInput.disabled = !checkoutConfig.payment?.enabled;
  if (hint && checkoutConfig.payment?.enabled) hint.textContent = "Оплата карткою, Apple Pay або Google Pay";
  if (hint && !checkoutConfig.payment?.enabled) hint.textContent = "Вимкнено у презентаційній демо-версії";
}

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity()) return;
  const rows = window.UrbanWearCart.getCartRows();
  if (!rows.length) return;
  const data = new FormData(checkoutForm);
  checkoutSubmitButton.disabled = true;
  checkoutMessage.textContent = "Створюємо замовлення...";
  try {
    const payload = await window.UrbanWearStore.api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_name: `${data.get("firstName")} ${data.get("lastName")}`.trim(),
        customer_email: data.get("email"),
        customer_phone: data.get("phone"),
        customer_city: data.get("city"),
        delivery_service: checkoutForm.querySelector('input[name="delivery"]:checked')?.closest(".checkout-option")?.querySelector("strong")?.textContent.trim() || "Нова пошта",
        delivery_office: data.get("office"),
        comment: data.get("deliveryComment") || "",
        payment_method: data.get("payment") || "cod",
        legal_consent: data.get("legalConsent") === "on",
        idempotency_key: checkoutIdempotencyKey,
        items: rows.map((row) => ({ product_id: row.product.id, selected_size: row.options.size, quantity: row.quantity, price: row.product.priceValue })),
      }),
    });
    window.UrbanWearOrders.rememberOrder(payload.order, String(data.get("email") || ""));
    window.UrbanWearCart.clearCart();
    checkoutForm.hidden = true;
    document.querySelector(".checkout-header").hidden = true;
    document.getElementById("checkoutSuccess").hidden = false;
    document.getElementById("checkoutSuccessBenefits").hidden = false;
    document.getElementById("checkoutSuccessNumber").textContent = payload.order.number;
  } catch (error) {
    checkoutMessage.textContent = error.message;
    checkoutSubmitButton.disabled = false;
  }
});

document.querySelectorAll(".checkout-option input").forEach((input) => input.addEventListener("change", () => {
  document.querySelectorAll(`input[name="${input.name}"]`).forEach((radio) => radio.closest(".checkout-option").classList.toggle("is-selected", radio.checked));
  if (input.name === "delivery") renderDeliveryFields();
}));

document.getElementById("copyOrderNumberButton").addEventListener("click", async () => {
  await navigator.clipboard?.writeText(document.getElementById("checkoutSuccessNumber").textContent);
});

renderDeliveryFields();
window.UrbanWearStore.ready.then(async () => {
  renderCheckout();
  await loadCheckoutConfig();
}).catch((error) => { checkoutMessage.textContent = error.message; });
