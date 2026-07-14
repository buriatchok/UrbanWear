const $ = (id) => document.getElementById(id);
const loginGate = $("adminLoginGate");
const dashboard = $("adminDashboard");
const statusTarget = $("adminStatus");
let adminProducts = [];
let adminOrders = [];
let adminCategories = [];
let adminAuditLogs = [];
let activeProduct = null;
let activeImages = [];
let activeCategory = null;
let cropImageIndex = -1;
let cropSourceImage = null;

const statusLabels = {
  new: "Нове", processing: "В обробці", shipped: "Відправлено", completed: "Завершено", cancelled: "Скасовано",
};
const paymentStatusLabels = {
  pending: "Очікується", awaiting_payment: "Очікує оплату", paid: "Оплачено",
  failed: "Помилка", refunded: "Повернено", cod: "При отриманні",
};

function escapeAdmin(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function setStatus(message) { statusTarget.textContent = message; }
function adminPrice(value) { return `${Number(value || 0).toLocaleString("uk-UA")} грн`; }
async function adminApi(path, options = {}) {
  try {
    return await window.UrbanWearStore.api(path, { ...options, headers: { ...window.UrbanWearAuth.adminHeaders(), ...(options.headers || {}) } });
  } catch (error) {
    if (error.status === 401) showLogin();
    throw error;
  }
}

function showLogin() {
  localStorage.removeItem("urbanwear-admin-active");
  loginGate.classList.remove("admin-hidden");
  dashboard.classList.add("admin-hidden");
}
function showDashboard() {
  loginGate.classList.add("admin-hidden");
  dashboard.classList.remove("admin-hidden");
  if (window.matchMedia("(max-width: 980px)").matches) setSidebarOpen(false);
  loadAdminData();
}

function setSidebarOpen(open) {
  dashboard.classList.toggle("admin-sidebar-collapsed", !open);
  const menuButton = document.querySelector(".admin-menu-button");
  if (menuButton) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Приховати меню" : "Відкрити меню");
  }
}

async function loadAdminData() {
  setStatus("Оновлюємо дані...");
  try {
    [adminProducts, adminOrders, adminCategories, adminAuditLogs] = await Promise.all([
      adminApi("/api/admin/products"),
      adminApi("/api/admin/orders"),
      adminApi("/api/admin/categories"),
      adminApi("/api/admin/audit-logs?limit=50"),
    ]);
    renderProducts();
    renderOrders();
    renderMetrics();
    renderCategories();
    renderAuditLogs();
    setStatus("Дані оновлено");
  } catch (error) {
    setStatus(error.message);
    if (error.message.includes("змініть початковий пароль")) {
      document.querySelector('[data-admin-tab="settings"]')?.click();
    }
  }
}

function renderAuditLogs() {
  const target = $("adminAuditLogs");
  if (!target) return;
  target.innerHTML = adminAuditLogs.length
    ? `<table class="admin-table"><thead><tr><th>Час</th><th>Дія</th><th>Об'єкт</th><th>IP</th></tr></thead><tbody>${adminAuditLogs.map((entry) => `<tr>
      <td>${new Date(entry.created_at).toLocaleString("uk-UA")}</td>
      <td><strong>${escapeAdmin(entry.action)}</strong><small>${escapeAdmin(entry.actor_type)} #${escapeAdmin(entry.actor_id || "")}</small></td>
      <td>${escapeAdmin(entry.entity_type)} ${escapeAdmin(entry.entity_id || "")}</td>
      <td>${escapeAdmin(entry.ip_address || "—")}</td>
    </tr>`).join("")}</tbody></table>`
    : '<div class="admin-empty">Журнал дій поки порожній.</div>';
}

function renderMetrics() {
  const active = adminProducts.filter((product) => product.is_active).length;
  const newOrders = adminOrders.filter((order) => order.status === "new").length;
  const revenue = adminOrders
    .filter((order) => order.status === "completed" && ["paid", "cod"].includes(order.payment_status))
    .reduce((sum, order) => sum + order.total_price, 0);
  $("adminMetrics").innerHTML = [
    ["Усього замовлень", adminOrders.length],
    ["Нові замовлення", newOrders],
    ["Загальна сума продажів", adminPrice(revenue)],
    ["Активні товари", active],
  ].map(([label, value]) => `<article class="admin-metric"><span>${label}</span><strong>${value}</strong></article>`).join("");
  $("adminOrderBadge").textContent = newOrders;
  $("recentOrdersReport").innerHTML = adminOrders.slice(0, 5).map((order) => `<p><strong>${order.number}</strong> · ${escapeAdmin(order.customer_name)} · ${adminPrice(order.total_price)}</p>`).join("") || "<p>Замовлень поки немає.</p>";
  $("topProductsReport").innerHTML = adminProducts.slice(0, 5).map((product) => `<p>${escapeAdmin(product.name)} · ${adminPrice(product.price)}</p>`).join("");
  $("linkClicksReport").innerHTML = "<p>Аналітика переходів зберігається локально у браузері.</p>";
  $("performanceReport").innerHTML = `<p>Активних товарів: <strong>${active}</strong></p><p>Нових замовлень: <strong>${newOrders}</strong></p>`;
}

function productStock(product) {
  return (product.sizes || []).reduce((sum, size) => sum + Number(size.quantity || 0), 0);
}
function renderProducts() {
  const query = $("adminSearchInput").value.trim().toLowerCase();
  const category = $("adminCategoryFilter").value;
  const rows = adminProducts.filter((product) => (!query || product.name.toLowerCase().includes(query) || product.slug.includes(query)) && (category === "all" || product.category === category));
  $("adminProductList").innerHTML = rows.length ? `<table class="admin-products-table"><thead><tr><th>Товар</th><th>Категорія</th><th>Ціна</th><th>Залишок</th><th>Статус</th><th>Дії</th></tr></thead><tbody>${rows.map((product) => `<tr>
    <td><strong>${escapeAdmin(product.name)}</strong><small>${escapeAdmin(product.slug)}</small></td>
    <td>${escapeAdmin(product.category_name)}</td><td>${adminPrice(product.price)}</td><td>${productStock(product)}</td>
    <td>${product.is_active ? "Активний" : "Прихований"}</td><td><div class="admin-row-actions">
      <button type="button" data-edit-product="${product.id}">Редагувати</button>
      <button type="button" data-toggle-product="${product.id}">${product.is_active ? "Приховати" : "Повернути"}</button>
    </div></td></tr>`).join("")}</tbody></table>` : '<div class="admin-empty">Товарів не знайдено.</div>';
}

function renderOrders() {
  $("adminOrdersList").innerHTML = adminOrders.length ? `<table class="admin-table"><thead><tr><th>№</th><th>Покупець</th><th>Телефон</th><th>Доставка</th><th>Сума</th><th>Статус</th><th>Оплата</th><th>ТТН</th><th>Товари</th></tr></thead><tbody>${adminOrders.map((order) => `<tr>
    <td><strong>${order.number}</strong><small>${new Date(order.created_at).toLocaleString("uk-UA")}</small></td>
    <td>${escapeAdmin(order.customer_name)}<small>${escapeAdmin(order.customer_city)}</small></td><td>${escapeAdmin(order.customer_phone)}</td>
    <td>${escapeAdmin(order.delivery_service)}<small>${escapeAdmin(order.delivery_office)}</small></td><td>${adminPrice(order.total_price)}</td>
    <td><select data-order-status="${order.id}">${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${value === order.status ? "selected" : ""}>${label}</option>`).join("")}</select></td>
    <td><select data-order-payment="${order.id}">${Object.entries(paymentStatusLabels).map(([value, label]) => `<option value="${value}" ${value === order.payment_status ? "selected" : ""}>${label}</option>`).join("")}</select></td>
    <td><div class="admin-row-actions"><input type="text" data-order-tracking="${order.id}" value="${escapeAdmin(order.tracking_number || "")}" placeholder="Номер ТТН" /><button type="button" data-save-tracking="${order.id}">Зберегти</button></div></td>
    <td>${order.items.map((item) => `${escapeAdmin(item.product_name)} (${escapeAdmin(item.selected_size)}) × ${item.quantity}`).join("<br>")}</td>
  </tr>`).join("")}</tbody></table>` : '<div class="admin-empty">Замовлень поки немає.</div>';
  $("adminOrderStats").innerHTML = `<strong>Усього: ${adminOrders.length}</strong> · Нових: ${adminOrders.filter((order) => order.status === "new").length}`;
}

function renderCategories() {
  const current = $("adminCategoryFilter").value || "all";
  const selectedProductCategory = $("productCategoryInput").value;
  $("adminCategoryFilter").innerHTML = `<option value="all">Усі категорії</option>${adminCategories.map((category) => `<option value="${escapeAdmin(category.slug)}">${escapeAdmin(category.name)}</option>`).join("")}`;
  $("adminCategoryFilter").value = adminCategories.some((category) => category.slug === current) ? current : "all";
  $("productCategoryInput").innerHTML = adminCategories.map((category) => `<option value="${escapeAdmin(category.slug)}">${escapeAdmin(category.name)}</option>`).join("");
  if (adminCategories.some((category) => category.slug === selectedProductCategory)) {
    $("productCategoryInput").value = selectedProductCategory;
  }
  $("adminCategoriesList").innerHTML = adminCategories.length
    ? `<table class="admin-table"><thead><tr><th>Категорія</th><th>Slug</th><th>Товарів</th><th>Дія</th></tr></thead><tbody>${adminCategories.map((category) => `<tr>
      <td><strong>${escapeAdmin(category.name)}</strong>${category.description ? `<small>${escapeAdmin(category.description)}</small>` : ""}</td>
      <td>${escapeAdmin(category.slug)}</td>
      <td>${category.product_count}</td>
      <td><div class="admin-row-actions"><button type="button" data-edit-category="${category.id}">Редагувати</button></div></td>
    </tr>`).join("")}</tbody></table>`
    : '<div class="admin-empty">Категорій поки немає.</div>';
}

function clearCategoryForm() {
  activeCategory = null;
  $("categoryForm").reset();
  $("categoryFormTitle").textContent = "Нова категорія";
  $("cancelCategoryButton").textContent = "Очистити";
}

function editCategory(category) {
  activeCategory = category;
  $("categoryFormTitle").textContent = "Редагувати категорію";
  $("categoryTitleInput").value = category.name;
  $("categorySlugInput").value = category.slug;
  $("categoryDescriptionInput").value = category.description || "";
  $("cancelCategoryButton").textContent = "Скасувати";
  $("categoryForm").scrollIntoView({ behavior: "smooth", block: "start" });
  $("categoryTitleInput").focus({ preventScroll: true });
}

function createSizesEditor() {
  if ($("productSizesInput")) return;
  const label = document.createElement("label");
  label.className = "admin-field-wide";
  label.innerHTML = 'Розміри та кількість <input type="text" id="productSizesInput" placeholder="S:10, M:12, L:8, XL:5" required />';
  $("productStockInput").closest("label").insertAdjacentElement("afterend", label);
  $("productStockInput").closest("label").hidden = true;
}
function parseSizes(value) {
  return String(value).split(",").map((entry) => {
    const [size, quantity] = entry.split(":");
    return { size: String(size || "").trim(), quantity: Math.max(0, Number(quantity || 0)) };
  }).filter((entry) => entry.size);
}
function slugify(value) {
  const transliteration = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
    ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
    ю: "yu", я: "ya",
  };
  return String(value || "").trim().toLowerCase().split("")
    .map((letter) => transliteration[letter] ?? letter).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function setProductDrawerTab(tabName) {
  document.querySelectorAll("[data-product-drawer-tab]").forEach((button) => {
    const isActive = button.dataset.productDrawerTab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll("[data-product-drawer-panel]").forEach((panel) => {
    const isActive = panel.dataset.productDrawerPanel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
}
function openProduct(product = null) {
  activeProduct = product;
  activeImages = product?.images ? [...product.images] : [];
  setProductDrawerTab("general");
  $("productDrawerTitle").textContent = product ? "Редагувати товар" : "Додати товар";
  $("productIdInput").value = product?.slug || "";
  $("productTitleInput").value = product?.name || "";
  $("productCategoryInput").value = product?.category || $("productCategoryInput").value;
  $("productCategoryTitleInput").value = product?.category_name || "";
  $("productPriceInput").value = product?.price || "";
  $("productComparePriceInput").value = product?.old_price || "";
  $("productImageLabelInput").value = product?.category_name || "";
  $("productShortInput").value = product?.short_description || "";
  $("productDescriptionInput").value = product?.description || "";
  $("productSpecsInput").value = (product?.specs || []).join("\n");
  $("productVisibleInput").checked = product?.is_active !== false;
  $("productPopularInput").checked = Boolean(product?.is_popular);
  $("productSizesInput").value = (product?.sizes || [{ size: "S", quantity: 10 }, { size: "M", quantity: 10 }, { size: "L", quantity: 10 }, { size: "XL", quantity: 10 }]).map((entry) => `${entry.size}:${entry.quantity}`).join(", ");
  renderImagePreview();
  $("productForm").classList.add("is-open");
  $("productForm").setAttribute("aria-hidden", "false");
  $("adminDrawerBackdrop").hidden = false;
}
function closeProduct() {
  closeCropEditor();
  $("productForm").classList.remove("is-open");
  $("productForm").setAttribute("aria-hidden", "true");
  $("adminDrawerBackdrop").hidden = true;
}
function renderImagePreview() {
  $("productImagesPreview").innerHTML = activeImages.map((image, index) => `<article class="admin-image-thumb">
    <span style="background-image:url('${escapeAdmin(image)}')"></span>
    <div class="admin-image-thumb__actions">
      <button type="button" data-crop-image="${index}">Обрізати</button>
      <button type="button" data-remove-image="${index}">Видалити</button>
    </div>
  </article>`).join("") || '<p class="admin-empty">Фото ще не додано</p>';
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
}
function drawCropPreview() {
  if (!cropSourceImage) return;
  const canvas = $("adminCropCanvas");
  const context = canvas.getContext("2d");
  const zoom = Number($("adminCropZoom").value);
  const positionX = Number($("adminCropX").value) / 100;
  const positionY = Number($("adminCropY").value) / 100;
  const scale = Math.max(canvas.width / cropSourceImage.naturalWidth, canvas.height / cropSourceImage.naturalHeight) * zoom;
  const width = cropSourceImage.naturalWidth * scale;
  const height = cropSourceImage.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (width - canvas.width) / 2);
  const maxOffsetY = Math.max(0, (height - canvas.height) / 2);
  const x = (canvas.width - width) / 2 + maxOffsetX * positionX;
  const y = (canvas.height - height) / 2 + maxOffsetY * positionY;
  context.fillStyle = "#f2f0ec";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(cropSourceImage, x, y, width, height);
}
function closeCropEditor() {
  cropImageIndex = -1;
  cropSourceImage = null;
  $("adminCropModal").hidden = true;
  $("adminCropModal").setAttribute("aria-hidden", "true");
  $("adminCropBackdrop").hidden = true;
  document.body.classList.remove("admin-crop-open");
}
function openCropEditor(index) {
  const source = activeImages[index];
  if (!source) return;
  const image = new Image();
  image.onload = () => {
    cropImageIndex = index;
    cropSourceImage = image;
    $("adminCropZoom").value = "1";
    $("adminCropX").value = "0";
    $("adminCropY").value = "0";
    $("adminCropModal").hidden = false;
    $("adminCropModal").setAttribute("aria-hidden", "false");
    $("adminCropBackdrop").hidden = false;
    document.body.classList.add("admin-crop-open");
    drawCropPreview();
  };
  image.onerror = () => setStatus("Не вдалося відкрити це фото для обрізання.");
  image.src = source;
}
function applyCrop() {
  if (cropImageIndex < 0 || !cropSourceImage) return;
  drawCropPreview();
  activeImages[cropImageIndex] = $("adminCropCanvas").toDataURL("image/jpeg", 0.88);
  closeCropEditor();
  renderImagePreview();
  setStatus("Фото обрізано. Збережіть товар, щоб застосувати зміни.");
}

document.querySelectorAll("[data-admin-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-admin-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.adminPanel === button.dataset.adminTab));
  $("adminSectionTitle").textContent = button.textContent.trim();
  if (window.matchMedia("(max-width: 980px)").matches) setSidebarOpen(false);
}));
document.querySelectorAll("[data-open-tab]").forEach((button) => button.addEventListener("click", () => document.querySelector(`[data-admin-tab="${button.dataset.openTab}"]`)?.click()));
document.querySelectorAll("[data-product-drawer-tab]").forEach((button) => button.addEventListener("click", () => {
  setProductDrawerTab(button.dataset.productDrawerTab);
}));
$("adminGateForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  try {
    const result = await window.UrbanWearAuth.adminLogin(data.get("email"), data.get("password"));
    $("adminLoginMessage").textContent = "";
    showDashboard();
    if (result.admin?.must_change_password) {
      document.querySelector('[data-admin-tab="settings"]')?.click();
      setStatus("Перед роботою змініть початковий пароль адміністратора.");
    }
  }
  catch (error) { $("adminLoginMessage").textContent = error.message; }
});
$("adminLogoutButton").addEventListener("click", () => { window.UrbanWearAuth.logout(); showLogin(); });
$("refreshAuditLogsButton")?.addEventListener("click", loadAdminData);
$("adminPasswordForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (data.get("new_password") !== data.get("confirm_password")) {
    return setStatus("Нові паролі не збігаються.");
  }
  try {
    const result = await adminApi("/api/admin/password", {
      method: "PATCH",
      body: JSON.stringify({
        current_password: data.get("current_password"),
        new_password: data.get("new_password"),
      }),
    });
    setStatus(result.message);
    event.currentTarget.reset();
    window.UrbanWearAuth.logout();
    showLogin();
  } catch (error) {
    setStatus(error.message);
  }
});
$("newProductButton").addEventListener("click", () => openProduct());
$("closeProductPanelButton").addEventListener("click", closeProduct);
$("cancelProductButton").addEventListener("click", closeProduct);
$("adminDrawerBackdrop").addEventListener("click", closeProduct);
$("refreshOrdersButton").addEventListener("click", loadAdminData);
$("adminSearchInput").addEventListener("input", renderProducts);
$("adminCategoryFilter").addEventListener("change", renderProducts);
$("adminCategoriesList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-category]");
  if (!button) return;
  const category = adminCategories.find((entry) => entry.id === Number(button.dataset.editCategory));
  if (category) editCategory(category);
});
$("categoryTitleInput").addEventListener("input", () => {
  if (!activeCategory) $("categorySlugInput").value = slugify($("categoryTitleInput").value);
});
$("cancelCategoryButton").addEventListener("click", clearCategoryForm);
$("categoryForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const wasEditing = Boolean(activeCategory);
  const body = {
    name: $("categoryTitleInput").value.trim(),
    slug: $("categorySlugInput").value.trim() || slugify($("categoryTitleInput").value),
    description: $("categoryDescriptionInput").value.trim(),
  };
  try {
    await adminApi(activeCategory ? `/api/admin/categories/${activeCategory.id}` : "/api/admin/categories", {
      method: activeCategory ? "PATCH" : "POST",
      body: JSON.stringify(body),
    });
    clearCategoryForm();
    await loadAdminData();
    setStatus(wasEditing ? "Категорію оновлено" : "Категорію створено");
  } catch (error) {
    setStatus(error.message);
  }
});
$("adminProductList").addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit-product]");
  const toggle = event.target.closest("[data-toggle-product]");
  if (edit) openProduct(adminProducts.find((product) => product.id === Number(edit.dataset.editProduct)));
  if (toggle) {
    const product = adminProducts.find((entry) => entry.id === Number(toggle.dataset.toggleProduct));
    await adminApi(`/api/admin/products/${product.id}${product.is_active ? "" : "/restore"}`, { method: product.is_active ? "DELETE" : "PATCH" });
    await loadAdminData();
  }
});
$("adminOrdersList").addEventListener("change", async (event) => {
  const statusId = event.target.dataset.orderStatus;
  const paymentId = event.target.dataset.orderPayment;
  if (!statusId && !paymentId) return;
  try {
    if (statusId) await adminApi(`/api/admin/orders/${statusId}/status`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
    if (paymentId) await adminApi(`/api/admin/orders/${paymentId}/payment`, { method: "PATCH", body: JSON.stringify({ payment_status: event.target.value }) });
    await loadAdminData();
  }
  catch (error) { setStatus(error.message); }
});
$("adminOrdersList").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-save-tracking]");
  if (!button) return;
  const input = document.querySelector(`[data-order-tracking="${button.dataset.saveTracking}"]`);
  try {
    await adminApi(`/api/admin/orders/${button.dataset.saveTracking}/tracking`, {
      method: "PATCH",
      body: JSON.stringify({ tracking_number: input?.value || "" }),
    });
    await loadAdminData();
    setStatus("Номер відстеження збережено.");
  } catch (error) {
    setStatus(error.message);
  }
});
$("productImagesInput").addEventListener("change", async (event) => {
  activeImages = [...activeImages, ...(await Promise.all([...event.target.files].slice(0, 4).map(fileToDataUrl)))].slice(0, 4);
  renderImagePreview();
});
$("productImagesPreview").addEventListener("click", (event) => {
  const cropButton = event.target.closest("[data-crop-image]");
  const removeButton = event.target.closest("[data-remove-image]");
  if (cropButton) openCropEditor(Number(cropButton.dataset.cropImage));
  if (removeButton) {
    activeImages.splice(Number(removeButton.dataset.removeImage), 1);
    renderImagePreview();
  }
});
$("clearProductImagesButton").addEventListener("click", () => { activeImages = []; renderImagePreview(); });
$("addProductImageUrlButton").addEventListener("click", () => {
  const input = $("productImageUrlInput");
  const value = input.value.trim();
  if (!/^https:\/\//i.test(value)) {
    return setStatus("Вкажіть HTTPS-посилання на фото із зовнішнього сховища.");
  }
  if (activeImages.length >= 4) return setStatus("Для одного товару дозволено до чотирьох фото.");
  activeImages.push(value);
  input.value = "";
  renderImagePreview();
});
$("adminCropCloseButton").addEventListener("click", closeCropEditor);
$("adminCropCancelButton").addEventListener("click", closeCropEditor);
$("adminCropBackdrop").addEventListener("click", closeCropEditor);
$("adminCropApplyButton").addEventListener("click", applyCrop);
["adminCropZoom", "adminCropX", "adminCropY"].forEach((id) => $(id).addEventListener("input", drawCropPreview));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("adminCropModal").hidden) closeCropEditor();
});
$("productForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = {
    name: $("productTitleInput").value.trim(), slug: $("productIdInput").value.trim() || slugify($("productTitleInput").value), category: $("productCategoryInput").value,
    price: Number(String($("productPriceInput").value).replace(/[^\d]/g, "")), old_price: Number(String($("productComparePriceInput").value).replace(/[^\d]/g, "")) || null,
    short_description: $("productShortInput").value.trim(), description: $("productDescriptionInput").value.trim(),
    images: activeImages, main_image: activeImages[0] || "", specs: $("productSpecsInput").value.split("\n").map((value) => value.trim()).filter(Boolean),
    is_popular: $("productPopularInput").checked, is_active: $("productVisibleInput").checked, sizes: parseSizes($("productSizesInput").value),
  };
  try {
    await adminApi(activeProduct ? `/api/admin/products/${activeProduct.id}` : "/api/admin/products", { method: activeProduct ? "PATCH" : "POST", body: JSON.stringify(body) });
    closeProduct();
    await loadAdminData();
    setStatus("Товар збережено");
  } catch (error) { setStatus(error.message); }
});
$("deleteProductButton").addEventListener("click", async () => {
  if (!activeProduct) return closeProduct();
  try {
    await adminApi(`/api/admin/products/${activeProduct.id}`, { method: "DELETE" });
    closeProduct();
    await loadAdminData();
    setStatus("Товар приховано");
  } catch (error) { setStatus(error.message); }
});

createSizesEditor();
$("categoryForm").hidden = false;
["customers", "analytics", "marketing", "content"].forEach((name) => {
  const tab = document.querySelector(`[data-admin-tab="${name}"]`);
  const panel = document.querySelector(`[data-admin-panel="${name}"]`);
  if (tab) tab.hidden = true;
  if (panel) panel.hidden = true;
});
document.querySelector(".admin-menu-button")?.addEventListener("click", (event) => {
  setSidebarOpen(dashboard.classList.contains("admin-sidebar-collapsed"));
});
$("adminSidebarBackdrop")?.addEventListener("click", () => setSidebarOpen(false));
document.querySelector(".admin-workspace")?.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".admin-menu-button")) return;
  if (window.matchMedia("(max-width: 980px)").matches && !dashboard.classList.contains("admin-sidebar-collapsed")) {
    setSidebarOpen(false);
  }
});
window.addEventListener("resize", () => {
  setSidebarOpen(!window.matchMedia("(max-width: 980px)").matches);
});
if (window.UrbanWearAuth.getAdminSession()) showDashboard(); else showLogin();
