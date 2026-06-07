let editableStoreData = cloneStoreData(storeData);
let activeProductId = Object.keys(editableStoreData.products)[0] || "";
let activeProductImages = [];

const $ = (id) => document.getElementById(id);
const adminLoginGate = $("adminLoginGate");
const adminDashboard = $("adminDashboard");
const adminGateForm = $("adminGateForm");
const adminLoginMessage = $("adminLoginMessage");
const adminStatus = $("adminStatus");
const adminMenuButton = document.querySelector(".admin-menu-button");
const adminSectionTitle = $("adminSectionTitle");
const adminSectionSubtitle = $("adminSectionSubtitle");
const settingsFields = document.querySelectorAll("[data-setting]");
const productList = $("adminProductList");
const productForm = $("productForm");
const productDrawerTitle = $("productDrawerTitle");
const adminDrawerBackdrop = $("adminDrawerBackdrop");
const productIdInput = $("productIdInput");
const productTitleInput = $("productTitleInput");
const productCategoryInput = $("productCategoryInput");
const productCategoryTitleInput = $("productCategoryTitleInput");
const productImageLabelInput = $("productImageLabelInput");
const productPriceInput = $("productPriceInput");
const productComparePriceInput = $("productComparePriceInput");
const productStockInput = $("productStockInput");
const productVisualInput = $("productVisualInput");
const productImagesInput = $("productImagesInput");
const productImagesPreview = $("productImagesPreview");
const clearProductImagesButton = $("clearProductImagesButton");
const productShortInput = $("productShortInput");
const productDescriptionInput = $("productDescriptionInput");
const productSpecsInput = $("productSpecsInput");
const productVisibleInput = $("productVisibleInput");
const productPopularInput = $("productPopularInput");
const adminSearchInput = $("adminSearchInput");
const adminCategoryFilter = $("adminCategoryFilter");
const adminOrderBadge = $("adminOrderBadge");

const categoryTitles = {
  hoodies: "Худі",
  "t-shirts": "Футболки",
  pants: "Штани",
  accessories: "Аксесуари",
};

const sectionCopy = {
  dashboard: ["Панель", "Ключові показники та стан магазину"],
  orders: ["Замовлення", "Керуйте замовленнями, оплатою, доставкою та статусами"],
  products: ["Товари", "Керуйте товарами, цінами, залишками та видимістю"],
  categories: ["Категорії", "Категорії каталогу та кількість товарів у кожній"],
  customers: ["Покупці", "Покупці з авторизації та оформлених замовлень"],
  analytics: ["Аналітика", "Відвідування сторінок, переходи та активність товарів"],
  marketing: ["Маркетинг", "Промо-тексти та повідомлення для покупців"],
  content: ["Контент", "Редагування текстів сайту, контактів і доставки"],
  settings: ["Налаштування", "Збереження, повернення та скидання демо-даних"],
};

const orderStatusLabels = {
  New: "Нове",
  Processing: "В обробці",
  Shipped: "Відправлено",
  Completed: "Завершено",
  Cancelled: "Скасовано",
};

function escapeAdminHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAdminAttribute(value) {
  return escapeAdminHtml(value).replaceAll("`", "&#096;");
}

function formatAdminPrice(value) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function getOrders() {
  return window.UrbanWearOrders ? window.UrbanWearOrders.getOrders() : [];
}

function setStatus(message) {
  adminStatus.textContent = message;
}

function isAdminLoggedIn() {
  return window.UrbanWearAuth && window.UrbanWearAuth.requireRole("admin");
}

function showDashboard() {
  adminLoginGate.classList.add("admin-hidden");
  adminDashboard.classList.remove("admin-hidden");
  if (window.matchMedia("(max-width: 820px)").matches) {
    adminDashboard.classList.add("admin-sidebar-collapsed");
    adminMenuButton.setAttribute("aria-expanded", "false");
  }
  renderAllAdminData();
}

function showLogin() {
  adminLoginGate.classList.remove("admin-hidden");
  adminDashboard.classList.add("admin-hidden");
}

function persistStoreData(message) {
  editableStoreData = saveStoreData(editableStoreData);
  renderAllAdminData();
  setStatus(message);
}

function fillSettingsFields() {
  settingsFields.forEach((field) => {
    field.value = editableStoreData.settings[field.dataset.setting] || "";
  });
}

function saveSettingsFields() {
  settingsFields.forEach((field) => {
    editableStoreData.settings[field.dataset.setting] = field.value.trim();
  });
  persistStoreData("Зміни збережено");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createEmptyProduct() {
  return {
    title: "",
    category: "hoodies",
    categoryTitle: "Худі",
    imageLabel: "Товар",
    price: "0 грн",
    comparePrice: "",
    stock: 0,
    shortDescription: "",
    isPopular: false,
    isVisible: true,
    visual: "linear-gradient(135deg, #171717, #777777)",
    images: [],
    description: "",
    specs: ["Матеріал:", "Крій:", "Колір:", "Сезон:", "Догляд:"],
  };
}

function normalizeProduct(product) {
  return {
    ...createEmptyProduct(),
    ...(product || {}),
    isVisible: product && product.isVisible === false ? false : true,
    stock: Number(
      product && Object.prototype.hasOwnProperty.call(product, "stock") ? product.stock : 100
    ),
    images: Array.isArray(product && product.images) ? product.images.filter(Boolean) : [],
  };
}

function getProductImages(product) {
  return normalizeProduct(product).images;
}

function createAdminProductThumbStyle(product) {
  const normalized = normalizeProduct(product);
  const primaryImage = normalized.images[0] || "";
  return primaryImage
    ? `background-image:url('${escapeAdminAttribute(primaryImage)}')`
    : `--product-bg:${escapeAdminAttribute(normalized.visual)}`;
}

function renderProductImagesPreview() {
  if (!activeProductImages.length) {
    productImagesPreview.innerHTML = '<p class="admin-empty">Фото ще не додано</p>';
    return;
  }

  productImagesPreview.innerHTML = activeProductImages
    .map(
      (image, index) => `
        <button class="admin-image-thumb" type="button" data-remove-product-image="${index}" aria-label="Видалити фото ${index + 1}">
          <span style="background-image:url('${escapeAdminAttribute(image)}')"></span>
        </button>`
    )
    .join("");

  productImagesPreview.querySelectorAll("[data-remove-product-image]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProductImages.splice(Number(button.dataset.removeProductImage), 1);
      renderProductImagesPreview();
    });
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.addEventListener("load", () => {
      const maxSize = 1400;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Фото не вдалося прочитати"));
    });
    image.src = objectUrl;
  });
}

async function handleProductImagesUpload(event) {
  const files = Array.from(event.target.files || []).filter((file) => {
    if (!file.type.startsWith("image/")) {
      setStatus("Додавайте лише зображення");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("Фото має бути до 5MB");
      return false;
    }
    return true;
  });

  try {
    const images = await Promise.all(files.map(readImageFile));
    activeProductImages = [...activeProductImages, ...images].slice(0, 4);
    renderProductImagesPreview();
    if (images.length) setStatus("Фото додано");
  } catch (error) {
    setStatus("Фото не вдалося завантажити");
  } finally {
    event.target.value = "";
  }
}

function openProductDrawer(productId = "") {
  activeProductId = productId;
  fillProductForm(productId);
  productDrawerTitle.textContent = productId ? "Редагувати товар" : "Додати товар";
  productForm.classList.add("is-open");
  productForm.setAttribute("aria-hidden", "false");
  adminDrawerBackdrop.hidden = false;
  requestAnimationFrame(() => adminDrawerBackdrop.classList.add("is-open"));
}

function closeProductDrawer() {
  productForm.classList.remove("is-open");
  productForm.setAttribute("aria-hidden", "true");
  adminDrawerBackdrop.classList.remove("is-open");
  setTimeout(() => {
    if (!adminDrawerBackdrop.classList.contains("is-open")) adminDrawerBackdrop.hidden = true;
  }, 220);
}

function fillProductForm(productId) {
  const product = normalizeProduct(editableStoreData.products[productId]);
  productIdInput.value = productId || "";
  productTitleInput.value = product.title;
  productCategoryInput.value = product.category;
  productCategoryTitleInput.value = product.categoryTitle || categoryTitles[product.category];
  productImageLabelInput.value = product.imageLabel;
  productPriceInput.value = product.price;
  productComparePriceInput.value = product.comparePrice || "";
  productStockInput.value = product.stock;
  productVisualInput.value = product.visual;
  productShortInput.value = product.shortDescription;
  productDescriptionInput.value = product.description;
  productSpecsInput.value = Array.isArray(product.specs) ? product.specs.join("\n") : "";
  productVisibleInput.checked = product.isVisible;
  productPopularInput.checked = Boolean(product.isPopular);
  activeProductImages = getProductImages(product);
  renderProductImagesPreview();
}

function collectProductForm() {
  const id = slugify(productIdInput.value) || slugify(productTitleInput.value) || `product-${Date.now()}`;
  return {
    id,
    product: {
      title: productTitleInput.value.trim(),
      category: productCategoryInput.value,
      categoryTitle: productCategoryTitleInput.value.trim() || categoryTitles[productCategoryInput.value],
      imageLabel: productImageLabelInput.value.trim() || "Товар",
      price: productPriceInput.value.trim() || "0 грн",
      comparePrice: productComparePriceInput.value.trim(),
      stock: Number(productStockInput.value || 0),
      shortDescription: productShortInput.value.trim(),
      isPopular: productPopularInput.checked,
      isVisible: productVisibleInput.checked,
      visual: productVisualInput.value.trim() || "linear-gradient(135deg, #171717, #777777)",
      images: [...activeProductImages],
      description: productDescriptionInput.value.trim(),
      specs: productSpecsInput.value.split("\n").map((line) => line.trim()).filter(Boolean),
    },
  };
}

function saveProduct(event) {
  event.preventDefault();
  const { id, product } = collectProductForm();
  if (!product.title) {
    setStatus("Додайте назву товару");
    return;
  }
  if (activeProductId && activeProductId !== id) delete editableStoreData.products[activeProductId];
  editableStoreData.products[id] = product;
  activeProductId = id;
  persistStoreData("Товар збережено");
  closeProductDrawer();
}

function deleteActiveProduct() {
  if (!activeProductId || !editableStoreData.products[activeProductId]) {
    setStatus("Оберіть товар для видалення");
    return;
  }
  if (!window.confirm("Видалити цей товар?")) return;
  delete editableStoreData.products[activeProductId];
  activeProductId = Object.keys(editableStoreData.products)[0] || "";
  persistStoreData("Товар видалено");
  closeProductDrawer();
}

function getFilteredProductEntries() {
  const query = adminSearchInput.value.trim().toLowerCase();
  const category = adminCategoryFilter.value;
  return Object.entries(editableStoreData.products).filter(([id, source]) => {
    const product = normalizeProduct(source);
    const matchesQuery =
      !query ||
      id.toLowerCase().includes(query) ||
      product.title.toLowerCase().includes(query) ||
      product.price.toLowerCase().includes(query);
    return matchesQuery && (category === "all" || product.category === category);
  });
}

function renderProductList() {
  const entries = getFilteredProductEntries();
  if (!entries.length) {
    productList.innerHTML = '<div class="admin-empty"><div><strong>Товарів не знайдено</strong><br>Змініть пошук або додайте новий товар.</div></div>';
    return;
  }

  productList.innerHTML = `
    <table class="admin-products-table">
      <thead><tr><th>Товар</th><th>Категорія</th><th>Ціна</th><th>Кількість</th><th>Статус</th><th>Дії</th></tr></thead>
      <tbody>${entries.map(([id, source]) => {
        const product = normalizeProduct(source);
        const level = product.stock <= 0 ? "out" : product.stock < 20 ? "low" : "in";
        const label = product.stock <= 0 ? "Немає в наявності" : product.stock < 20 ? "Мало" : "В наявності";
        return `<tr>
          <td><button class="admin-product-name" type="button" data-edit-product="${escapeAdminAttribute(id)}">
            <span class="admin-product-thumb" style="${createAdminProductThumbStyle(product)}">${escapeAdminHtml(product.imageLabel)}</span>
            <span><strong>${escapeAdminHtml(product.title || "Без назви")}</strong><small>SKU: ${escapeAdminHtml(id)}</small></span>
          </button></td>
          <td>${escapeAdminHtml(product.categoryTitle)}</td>
          <td>${escapeAdminHtml(product.price)}</td>
          <td><span class="admin-stock-badge is-${level}">${label}</span><small>${product.stock} шт.</small></td>
          <td><button class="admin-switch ${product.isVisible ? "is-on" : ""}" type="button" data-toggle-product-visible="${escapeAdminAttribute(id)}" aria-label="Змінити видимість"></button></td>
          <td><div class="admin-row-actions">
            <button type="button" data-edit-product="${escapeAdminAttribute(id)}">Редагувати</button>
            <button type="button" data-delete-product="${escapeAdminAttribute(id)}">Видалити</button>
          </div></td>
        </tr>`;
      }).join("")}</tbody>
    </table>`;

  productList.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => openProductDrawer(button.dataset.editProduct));
  });
  productList.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProductId = button.dataset.deleteProduct;
      deleteActiveProduct();
    });
  });
  productList.querySelectorAll("[data-toggle-product-visible]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.toggleProductVisible;
      const product = normalizeProduct(editableStoreData.products[id]);
      product.isVisible = !product.isVisible;
      editableStoreData.products[id] = product;
      persistStoreData(product.isVisible ? "Товар показано на сайті" : "Товар приховано із сайту");
    });
  });
}

const pageTitleMap = {
  "index.html": "Головна",
  "catalog.html": "Каталог",
  "product.html": "Сторінка товару",
  "delivery.html": "Доставка й оплата",
  "contacts.html": "Контакти",
  "auth.html": "Вхід / реєстрація",
  "account.html": "Кабінет покупця",
  "cart.html": "Кошик",
  "checkout.html": "Оформлення замовлення",
  "admin.html": "Панель керування",
  unknown: "Невідома сторінка",
};

function renderKeyValueReport(targetId, data, formatLabel = (label) => label) {
  const target = $(targetId);
  if (!target) return;
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  target.innerHTML = rows.length
    ? rows.map(([label, value]) => `<p><span>${escapeAdminHtml(formatLabel(label))}</span><strong>${value}</strong></p>`).join("")
    : '<div class="admin-empty">Даних поки немає</div>';
}

function formatPageVisitLabel(label) {
  const clean = String(label || "unknown").split("?")[0].split("#")[0];
  return pageTitleMap[clean] || clean;
}

function renderTopProducts(summary) {
  const rows = [...(summary.productRows || [])]
    .sort((a, b) => b.cartAdds + b.views - (a.cartAdds + a.views))
    .slice(0, 5);
  $("topProductsReport").innerHTML = rows.length
    ? rows.map((row) => {
        const entry = Object.entries(editableStoreData.products).find(([, product]) => product.title === row.title);
        const product = entry ? normalizeProduct(entry[1]) : createEmptyProduct();
        return `<p class="admin-top-product">
          <span class="admin-product-thumb" style="${createAdminProductThumbStyle(product)}"></span>
          <span><strong>${escapeAdminHtml(row.title)}</strong><small>${row.views} переглядів · ${row.cartAdds} у кошику</small></span>
          <b>${escapeAdminHtml(row.price)}</b>
        </p>`;
      }).join("")
    : '<div class="admin-empty">Даних про товари поки немає</div>';
}

function renderRecentOrders(orders) {
  const target = $("recentOrdersReport");
  const recent = orders.slice(0, 5);
  target.innerHTML = recent.length
    ? recent.map((order) => `<p><span><strong>${escapeAdminHtml(order.number)}</strong><br><small>${escapeAdminHtml(order.customer.name)}</small></span><span>${formatAdminPrice(order.total)} · ${orderStatusLabels[order.status] || order.status}</span></p>`).join("")
    : '<div class="admin-empty"><div><strong>Замовлень поки немає</strong><br>Перші замовлення з checkout зʼявляться тут.</div></div>';
}

function renderPerformance(summary, orderSummary) {
  const average = orderSummary.totalOrders ? Math.round(orderSummary.totalRevenue / orderSummary.totalOrders) : 0;
  $("performanceReport").innerHTML = `
    <p><span>Загальні продажі</span><strong>${formatAdminPrice(orderSummary.totalRevenue)}</strong></p>
    <p><span>Замовлення</span><strong>${orderSummary.totalOrders}</strong></p>
    <p><span>Покупці</span><strong>${orderSummary.customers}</strong></p>
    <p><span>Середній чек</span><strong>${formatAdminPrice(average)}</strong></p>
    <p><span>Нові замовлення</span><strong>${orderSummary.newOrders}</strong></p>`;
}

function renderAnalytics() {
  if (!window.UrbanWearAnalytics) return;
  const summary = window.UrbanWearAnalytics.getSummary(editableStoreData.products);
  const orders = getOrders();
  const orderSummary = window.UrbanWearOrders.getOrderSummary(orders);
  const average = orderSummary.totalOrders ? Math.round(orderSummary.totalRevenue / orderSummary.totalOrders) : 0;

  $("adminMetrics").innerHTML = `
    <article><span>Загальні продажі</span><strong>${formatAdminPrice(orderSummary.totalRevenue)}</strong><small>Сума завершених і активних замовлень</small></article>
    <article><span>Замовлення</span><strong>${orderSummary.totalOrders}</strong><small>${orderSummary.newOrders} нових</small></article>
    <article><span>Покупці</span><strong>${orderSummary.customers}</strong><small>Унікальні контакти</small></article>
    <article><span>Середній чек</span><strong>${formatAdminPrice(average)}</strong><small>За всіма замовленнями</small></article>
    <article><span>Додано в кошик</span><strong>${summary.totalCartAdds}</strong><small>За даними браузера</small></article>`;

  renderRecentOrders(orders);
  renderKeyValueReport("linkClicksReport", summary.linkClicks);
  renderKeyValueReport("pageVisitsReport", summary.pageVisits, formatPageVisitLabel);
  renderKeyValueReport("analyticsLinkClicksReport", summary.linkClicks);
  renderTopProducts(summary);
  renderPerformance(summary, orderSummary);

  $("productsReport").innerHTML = `<table class="admin-table">
    <thead><tr><th>Товар</th><th>Ціна</th><th>Перегляди</th><th>Кошик</th><th>Популярний</th></tr></thead>
    <tbody>${summary.productRows.map((row) => `<tr><td>${escapeAdminHtml(row.title)}</td><td>${escapeAdminHtml(row.price)}</td><td>${row.views}</td><td>${row.cartAdds}</td><td>${row.isPopular ? "Так" : "Ні"}</td></tr>`).join("")}</tbody>
  </table>`;

  adminOrderBadge.textContent = String(orderSummary.newOrders);
  $("adminOrderStats").innerHTML = `
    <article><span>Нові</span><strong>${orderSummary.newOrders}</strong></article>
    <article><span>В обробці</span><strong>${orderSummary.processingOrders}</strong></article>
    <article><span>Завершені</span><strong>${orderSummary.completedOrders}</strong></article>
    <article><span>Загальна сума</span><strong>${formatAdminPrice(orderSummary.totalRevenue)}</strong></article>`;
}

function renderOrders() {
  const orders = getOrders();
  const target = $("adminOrdersList");
  if (!orders.length) {
    target.innerHTML = '<div class="admin-empty"><div><strong>Замовлень поки немає</strong><br>Перші замовлення з checkout зʼявляться тут.</div></div>';
    return;
  }
  const statuses = Object.keys(orderStatusLabels);
  target.innerHTML = `<table class="admin-table admin-orders-table">
    <thead><tr><th>Номер</th><th>Дата</th><th>Покупець</th><th>Телефон</th><th>Сума</th><th>Доставка / оплата</th><th>Статус</th><th>Дії</th></tr></thead>
    <tbody>${orders.map((order) => `<tr>
      <td><strong>${escapeAdminHtml(order.number || order.id)}</strong></td>
      <td>${new Date(order.createdAt).toLocaleDateString("uk-UA")}</td>
      <td><strong>${escapeAdminHtml(order.customer.name)}</strong><small>${escapeAdminHtml(order.customer.email)}</small></td>
      <td>${escapeAdminHtml(order.customer.phone || "Не вказано")}</td>
      <td>${formatAdminPrice(order.total)}</td>
      <td>${escapeAdminHtml(order.delivery.method)}<small>${escapeAdminHtml(order.payment.method)}</small></td>
      <td><select data-order-status="${escapeAdminAttribute(order.id)}">${statuses.map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${orderStatusLabels[status]}</option>`).join("")}</select></td>
      <td><div class="admin-row-actions"><button type="button" data-order-details="${escapeAdminAttribute(order.id)}">Деталі</button><button type="button" data-delete-order="${escapeAdminAttribute(order.id)}">Видалити</button></div></td>
    </tr><tr class="admin-order-details" id="order-details-${escapeAdminAttribute(order.id)}" hidden><td colspan="8">
      <div class="admin-order-details__meta">
        <span><strong>Контакт:</strong> ${escapeAdminHtml(order.customer.email || order.customer.phone || "Не вказано")}</span>
        <span><strong>Доставка:</strong> ${escapeAdminHtml([order.delivery.city, order.delivery.branch].filter(Boolean).join(", ") || "Не вказано")}</span>
      </div>
      ${order.items.map((item) => `<p><span>${escapeAdminHtml(item.title)}${item.size ? ` · розмір ${escapeAdminHtml(item.size)}` : ""} × ${item.quantity}</span><strong>${formatAdminPrice(item.price * item.quantity)}</strong></p>`).join("")}
    </td></tr>`).join("")}</tbody>
  </table>`;

  target.querySelectorAll("[data-order-status]").forEach((select) => {
    select.addEventListener("change", () => {
      window.UrbanWearOrders.updateOrderStatus(select.dataset.orderStatus, select.value);
      renderAllAdminData();
      setStatus("Статус замовлення оновлено");
    });
  });
  target.querySelectorAll("[data-order-details]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = $(`order-details-${button.dataset.orderDetails}`);
      row.hidden = !row.hidden;
    });
  });
  target.querySelectorAll("[data-delete-order]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.confirm("Видалити замовлення?")) return;
      window.UrbanWearOrders.deleteOrder(button.dataset.deleteOrder);
      renderAllAdminData();
      setStatus("Замовлення видалено");
    });
  });
}

function renderCategories() {
  $("adminCategoriesList").innerHTML = `<table class="admin-table">
    <thead><tr><th>Категорія</th><th>Slug</th><th>Товарів</th><th>Дія</th></tr></thead>
    <tbody>${Object.entries(categoryTitles).map(([slug, title]) => {
      const count = Object.values(editableStoreData.products).filter((product) => normalizeProduct(product).category === slug).length;
      return `<tr><td><strong>${title}</strong></td><td>${slug}</td><td>${count}</td><td><button class="admin-table-link" type="button" data-category-products="${slug}">Переглянути товари</button></td></tr>`;
    }).join("")}</tbody>
  </table>`;
  document.querySelectorAll("[data-category-products]").forEach((button) => {
    button.addEventListener("click", () => {
      adminCategoryFilter.value = button.dataset.categoryProducts;
      activateTab("products");
    });
  });
}

function getCustomerSourceLabel(source) {
  if (source === "password") return "Реєстрація";
  if (source === "Замовлення") return "Замовлення (н/а)";
  return source || "Авторизація";
}

function renderCustomers() {
  const orders = getOrders();
  const users = (window.UrbanWearAuth ? window.UrbanWearAuth.getUsers() : []).filter((user) => user.role !== "admin");
  const map = new Map();
  users.forEach((user) => map.set(user.email, { name: user.name, email: user.email, phone: "", source: getCustomerSourceLabel(user.provider), orders: 0, total: 0 }));
  orders.forEach((order) => {
    const key = order.customer.email || order.customer.phone;
    const customer = map.get(key) || { name: order.customer.name, email: order.customer.email, phone: order.customer.phone, source: "Замовлення (н/а)", orders: 0, total: 0 };
    customer.phone = customer.phone || order.customer.phone;
    customer.orders += 1;
    customer.total += Number(order.total || 0);
    map.set(key, customer);
  });
  const customers = [...map.values()];
  $("adminCustomersList").innerHTML = customers.length
    ? `<table class="admin-table"><thead><tr><th>Покупець</th><th>Email</th><th>Телефон</th><th>Джерело</th><th>Замовлень</th><th>Сума</th></tr></thead><tbody>${customers.map((customer) => `<tr><td>${escapeAdminHtml(customer.name || "Покупець")}</td><td>${escapeAdminHtml(customer.email || "Не вказано")}</td><td>${escapeAdminHtml(customer.phone || "Не вказано")}</td><td>${escapeAdminHtml(getCustomerSourceLabel(customer.source))}</td><td>${customer.orders}</td><td>${formatAdminPrice(customer.total)}</td></tr>`).join("")}</tbody></table>`
    : '<div class="admin-empty"><div><strong>Покупців поки немає</strong><br>Покупці з авторизації та замовлень зʼявляться тут.</div></div>';
}

function renderAllAdminData() {
  renderAnalytics();
  renderProductList();
  renderOrders();
  renderCategories();
  renderCustomers();
}

function activateTab(name) {
  const button = document.querySelector(`[data-admin-tab="${name}"]`);
  if (!button) return;
  document.querySelectorAll("[data-admin-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.adminPanel === name));
  adminSectionTitle.textContent = sectionCopy[name][0];
  adminSectionSubtitle.textContent = sectionCopy[name][1];
  if (window.matchMedia("(max-width: 820px)").matches) {
    adminDashboard.classList.add("admin-sidebar-collapsed");
    adminMenuButton.setAttribute("aria-expanded", "false");
  }
  renderAllAdminData();
}

document.querySelectorAll("[data-admin-tab]").forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.adminTab)));
document.querySelectorAll("[data-open-tab]").forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.openTab)));
document.querySelectorAll("[data-product-drawer-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-product-drawer-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
    document.querySelectorAll("[data-product-drawer-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.productDrawerPanel === button.dataset.productDrawerTab));
  });
});

adminGateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  try {
    window.UrbanWearAuth.login(data.get("email"), data.get("password"), "admin");
    showDashboard();
  } catch (error) {
    adminLoginMessage.textContent = error.message;
  }
});

$("adminLogoutButton").addEventListener("click", () => { window.UrbanWearAuth.logout(); showLogin(); });
document.querySelectorAll("[data-save-settings]").forEach((button) => button.addEventListener("click", saveSettingsFields));
$("revertChangesButton").addEventListener("click", () => {
  editableStoreData = getStoreData();
  fillSettingsFields();
  renderAllAdminData();
  setStatus("Повернуто останні збережені дані");
});
$("resetDataButton").addEventListener("click", () => {
  if (!window.confirm("Скинути всі зміни до демо-даних?")) return;
  editableStoreData = resetStoreData();
  fillSettingsFields();
  renderAllAdminData();
  setStatus("Демо-дані відновлено");
});
$("refreshOrdersButton").addEventListener("click", () => { renderAllAdminData(); setStatus("Замовлення оновлено"); });
$("resetAnalyticsButton").addEventListener("click", () => {
  if (!window.confirm("Очистити локальну аналітику?")) return;
  window.UrbanWearAnalytics.reset();
  renderAllAdminData();
  setStatus("Аналітику очищено");
});

productCategoryInput.addEventListener("change", () => { productCategoryTitleInput.value = categoryTitles[productCategoryInput.value]; });
productForm.addEventListener("submit", saveProduct);
$("newProductButton").addEventListener("click", () => { openProductDrawer(""); setStatus("Заповніть дані нового товару"); });
$("closeProductPanelButton").addEventListener("click", closeProductDrawer);
$("cancelProductButton").addEventListener("click", closeProductDrawer);
adminDrawerBackdrop.addEventListener("click", closeProductDrawer);
$("deleteProductButton").addEventListener("click", deleteActiveProduct);
productImagesInput.addEventListener("change", handleProductImagesUpload);
clearProductImagesButton.addEventListener("click", () => { activeProductImages = []; renderProductImagesPreview(); setStatus("Фото очищено"); });
adminSearchInput.addEventListener("input", () => { activateTab("products"); });
adminCategoryFilter.addEventListener("change", renderProductList);
adminMenuButton.addEventListener("click", () => {
  const collapsed = adminDashboard.classList.toggle("admin-sidebar-collapsed");
  adminMenuButton.setAttribute("aria-expanded", String(!collapsed));
});

fillSettingsFields();
renderAllAdminData();
if (isAdminLoggedIn()) showDashboard(); else showLogin();
