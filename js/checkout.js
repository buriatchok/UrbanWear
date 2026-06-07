const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutShortfall = document.getElementById("checkoutShortfall");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutSubmitButton = document.getElementById("checkoutSubmitButton");
const deliveryDynamicFields = document.getElementById("deliveryDynamicFields");
const checkoutSuccess = document.getElementById("checkoutSuccess");
const checkoutSuccessNumber = document.getElementById("checkoutSuccessNumber");
const checkoutSuccessBenefits = document.getElementById("checkoutSuccessBenefits");
const copyOrderNumberButton = document.getElementById("copyOrderNumberButton");
const checkoutSession = window.UrbanWearAuth?.getSession();
const checkoutProfile = checkoutSession?.role === "customer" ? window.UrbanWearProfile.getProfile(checkoutSession) : null;

function getCheckoutRows() {
  const cart = window.UrbanWearCart?.getCart() || {};
  const meta = window.UrbanWearCart?.getCartMeta() || {};
  return Object.entries(cart).filter(([id]) => products[id]).map(([id, quantity]) => ({
    id, product: products[id], quantity: Number(quantity), options: meta[id] || {},
    price: parsePrice(products[id].price), subtotal: parsePrice(products[id].price) * Number(quantity),
  }));
}

function getCheckoutTotals() {
  const subtotal = getCheckoutRows().reduce((sum, row) => sum + row.subtotal, 0);
  const promo = localStorage.getItem("urbanwear-promo") || "";
  const discountRate = promo === "URBAN10" ? .1 : promo === "WELCOME5" ? .05 : 0;
  const discount = Math.round(subtotal * discountRate);
  const delivery = promo === "FREEDELIVERY" || subtotal >= 1500 ? 0 : 120;
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}

function getCheckoutImage(product) {
  const image = Array.isArray(product.images) ? product.images.filter(Boolean)[0] : "";
  return image ? `background-image:url('${escapeCartHtml(image)}')` : `--product-bg:${escapeCartHtml(product.visual)}`;
}

function renderCheckoutSummary() {
  const rows = getCheckoutRows();
  const totals = getCheckoutTotals();
  if (!rows.length) {
    checkoutItems.innerHTML = '<div class="checkout-empty"><strong>Кошик порожній</strong><a class="btn btn--dark" href="catalog.html">До каталогу</a></div>';
    checkoutTotal.textContent = "0 грн";
    checkoutShortfall.textContent = "Додайте товари, щоб оформити замовлення.";
    checkoutSubmitButton.disabled = true;
    return;
  }
  checkoutItems.innerHTML = rows.map((row) => `
    <article class="checkout-summary-item">
      <div class="checkout-summary-item__image" style="${getCheckoutImage(row.product)}"><span>${escapeCartHtml(row.product.imageLabel)}</span></div>
      <div><h3>${escapeCartHtml(row.product.title)}</h3>${row.options.size ? `<p>Розмір: ${escapeCartHtml(row.options.size)}</p>` : ""}<p>Кількість: ${row.quantity}</p></div>
      <strong>${formatPrice(row.subtotal)}</strong>
    </article>`).join("");
  checkoutTotal.textContent = formatPrice(totals.total);
  const shortfall = Math.max(0, 1500 - totals.subtotal);
  checkoutShortfall.textContent = shortfall ? `До безкоштовної доставки не вистачає ${formatPrice(shortfall)}` : "Для замовлення доступна безкоштовна доставка";
  checkoutSubmitButton.disabled = false;
}

function renderDeliveryFields() {
  const method = checkoutForm.querySelector('input[name="delivery"]:checked')?.value || "branch";
  const city = '<label>Населений пункт <input type="text" name="city" required /></label>';
  const fields = {
    branch: `${city}<label>Номер відділення <input type="text" name="branch" required /></label>`,
    postomat: `${city}<label>Номер поштомату <input type="text" name="postomat" required /></label>`,
    courier: `${city}<label>Вулиця <input type="text" name="street" required /></label><label>Будинок <input type="text" name="house" required /></label><label>Квартира <input type="text" name="apartment" /></label>`,
  };
  deliveryDynamicFields.innerHTML = fields[method];
  autofillDeliveryProfile();
}

function setCheckoutValue(name, value) {
  const field = checkoutForm.elements[name];
  if (field && value && !field.value) field.value = value;
}

function autofillDeliveryProfile() {
  if (!checkoutProfile || !(checkoutProfile.useAsDefault || checkoutProfile.defaultAddressEnabled)) return;
  setCheckoutValue("city", checkoutProfile.city);
  const method = checkoutForm.querySelector('input[name="delivery"]:checked')?.value || "branch";
  if (method === "branch") setCheckoutValue("branch", checkoutProfile.address);
  if (method === "postomat") setCheckoutValue("postomat", checkoutProfile.address);
  if (method === "courier") setCheckoutValue("street", checkoutProfile.address);
}

function autofillCheckoutProfile() {
  if (!checkoutProfile) return;
  if (checkoutProfile.useAsDefault || checkoutProfile.autofillPersonalData) {
    setCheckoutValue("firstName", checkoutProfile.firstName);
    setCheckoutValue("lastName", checkoutProfile.lastName);
    setCheckoutValue("email", checkoutProfile.email);
    setCheckoutValue("phone", checkoutProfile.phone);
  }
  if (checkoutProfile.useAsDefault || checkoutProfile.defaultAddressEnabled) {
    autofillDeliveryProfile();
    setCheckoutValue("deliveryComment", checkoutProfile.deliveryComment);
  }
  if (checkoutProfile.useAsDefault || checkoutProfile.defaultPaymentEnabled) {
    const defaultPayment = checkoutForm.querySelector('input[name="payment"][value="full"]');
    if (defaultPayment) defaultPayment.checked = true;
  }
}

function getSelectedText(name) {
  return checkoutForm.querySelector(`input[name="${name}"]:checked`)?.closest(".checkout-option")?.querySelector("strong")?.textContent.trim() || "";
}

function collectOrder() {
  const data = new FormData(checkoutForm);
  const rows = getCheckoutRows();
  return {
    customer: { name: `${data.get("firstName")} ${data.get("lastName")}`.trim(), phone: data.get("phone"), email: data.get("email"), city: data.get("city") },
    delivery: { method: getSelectedText("delivery"), city: data.get("city"), branch: data.get("branch") || data.get("postomat") || [data.get("street"), data.get("house"), data.get("apartment")].filter(Boolean).join(", "), comment: data.get("deliveryComment") || "" },
    payment: { method: getSelectedText("payment") },
    items: rows.map((row) => ({ id: row.id, title: row.product.title, price: row.price, quantity: row.quantity, image: row.product.images?.[0] || "", size: row.options.size || "" })),
    total: getCheckoutTotals().total,
    promo: localStorage.getItem("urbanwear-promo") || "",
  };
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity()) return;
  if (!getCheckoutRows().length) { checkoutMessage.textContent = "Кошик порожній."; return; }
  const order = window.UrbanWearOrders.createOrder(collectOrder());
  window.UrbanWearCart.clearCart();
  checkoutForm.hidden = true;
  document.querySelector(".checkout-header").hidden = true;
  checkoutSuccess.hidden = false;
  checkoutSuccessBenefits.hidden = false;
  checkoutSuccessNumber.textContent = order.number;
});

document.querySelectorAll(".checkout-option input").forEach((input) => {
  input.addEventListener("change", () => {
    document.querySelectorAll(`input[name="${input.name}"]`).forEach((radio) => radio.closest(".checkout-option").classList.toggle("is-selected", radio.checked));
    if (input.name === "delivery") renderDeliveryFields();
  });
});

renderDeliveryFields();
renderCheckoutSummary();

if (checkoutSession?.role === "customer" && !checkoutProfile?.autofillPersonalData && !checkoutProfile?.useAsDefault) {
  const nameParts = checkoutSession.name.trim().split(/\s+/);
  checkoutForm.elements.firstName.value = nameParts[0] || "";
  checkoutForm.elements.lastName.value = nameParts.slice(1).join(" ");
  checkoutForm.elements.email.value = checkoutSession.email || "";
}
autofillCheckoutProfile();

copyOrderNumberButton.addEventListener("click", async () => {
  const value = checkoutSuccessNumber.textContent;
  try {
    await navigator.clipboard.writeText(value);
    copyOrderNumberButton.textContent = "✓";
  } catch (error) {
    copyOrderNumberButton.textContent = value;
  }
});
