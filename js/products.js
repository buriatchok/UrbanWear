const DEMO_PRODUCTS_KEY = "urbanwear-demo-products";
const DEMO_CATEGORIES_KEY = "urbanwear-demo-categories";
const DEMO_API_ORDERS_KEY = "urbanwear-demo-api-orders";
const DEMO_AUDIT_KEY = "urbanwear-demo-audit";

const demoInitialCategories = [
  { id: 1, name: "Худі", slug: "hoodies", description: "Oversize худі, світшоти та теплі базові силуети." },
  { id: 2, name: "Футболки", slug: "t-shirts", description: "Щільні базові футболки для щоденних міських образів." },
  { id: 3, name: "Штани", slug: "pants", description: "Cargo та relaxed fit моделі для активного ритму." },
  { id: 4, name: "Куртки", slug: "jackets", description: "Легкі міські куртки з лаконічним силуетом." },
  { id: 5, name: "Аксесуари", slug: "accessories", description: "Кепки та сумки для завершеного streetwear-образу." },
];

const demoInitialProducts = [
  {
    id: 1,
    name: "Oversize Hoodie Black",
    slug: "oversize-hoodie-black",
    category: "hoodies",
    category_name: "Худі",
    price: 1899,
    old_price: 0,
    brand: "UrbanWear",
    description: "Щільне чорне oversize худі для прохолодних міських днів.",
    short_description: "Чорне oversize худі зі щільного футеру.",
    main_image: "assets/products/hoodie-black-1.png",
    images: ["assets/products/hoodie-black-1.png", "assets/products/hoodie-black-2.png", "assets/products/hoodie-black-3.png"],
    specs: ["Матеріал: бавовна / поліестер", "Крій: oversize", "Колір: чорний"],
    sizes: [
      { size: "S", quantity: 8 },
      { size: "M", quantity: 10 },
      { size: "L", quantity: 12 },
      { size: "XL", quantity: 14 },
    ],
    is_popular: true,
    is_active: true,
  },
  {
    id: 2,
    name: "Basic T-Shirt White",
    slug: "basic-t-shirt-white",
    category: "t-shirts",
    category_name: "Футболки",
    price: 799,
    old_price: 0,
    brand: "UrbanWear",
    description: "Щільна біла футболка з чистим прямим силуетом.",
    short_description: "Біла базова футболка regular fit.",
    main_image: "assets/products/tshirt-white-1.png",
    images: ["assets/products/tshirt-white-1.png", "assets/products/tshirt-white-2.png", "assets/products/tshirt-white-3.png"],
    specs: ["Матеріал: 100% бавовна", "Крій: regular fit", "Колір: білий"],
    sizes: [
      { size: "S", quantity: 9 },
      { size: "M", quantity: 11 },
      { size: "L", quantity: 13 },
      { size: "XL", quantity: 15 },
    ],
    is_popular: true,
    is_active: true,
  },
  {
    id: 3,
    name: "Cargo Pants Dark Grey",
    slug: "cargo-pants-dark-grey",
    category: "pants",
    category_name: "Штани",
    price: 1599,
    old_price: 0,
    brand: "UrbanWear",
    description: "Практичні cargo штани relaxed fit із функціональними кишенями.",
    short_description: "Графітові cargo штани relaxed fit.",
    main_image: "assets/products/cargo-pants-1.png",
    images: ["assets/products/cargo-pants-1.png", "assets/products/cargo-pants-2.png", "assets/products/cargo-pants-3.png"],
    specs: ["Матеріал: щільна бавовна", "Крій: relaxed fit", "Колір: графітовий"],
    sizes: [
      { size: "S", quantity: 10 },
      { size: "M", quantity: 12 },
      { size: "L", quantity: 14 },
      { size: "XL", quantity: 16 },
    ],
    is_popular: true,
    is_active: true,
  },
  {
    id: 4,
    name: "Zip Hoodie Beige",
    slug: "zip-hoodie-beige",
    category: "hoodies",
    category_name: "Худі",
    price: 1999,
    old_price: 0,
    brand: "UrbanWear",
    description: "Бежеве худі на блискавці для багатошарових образів.",
    short_description: "Худі на блискавці у спокійному бежевому тоні.",
    main_image: "assets/products/hoodie-black-1.png",
    images: ["assets/products/hoodie-black-1.png"],
    specs: ["Матеріал: бавовна / поліестер", "Крій: relaxed", "Колір: бежевий"],
    sizes: [
      { size: "S", quantity: 11 },
      { size: "M", quantity: 13 },
      { size: "L", quantity: 15 },
      { size: "XL", quantity: 17 },
    ],
    is_popular: false,
    is_active: true,
  },
  {
    id: 5,
    name: "Classic Sweatshirt Grey",
    slug: "classic-sweatshirt-grey",
    category: "hoodies",
    category_name: "Худі",
    price: 1399,
    old_price: 0,
    brand: "UrbanWear",
    description: "Сірий базовий світшот на кожен день.",
    short_description: "Лаконічний сірий світшот regular fit.",
    main_image: "assets/products/longsleeve-grey-1.png",
    images: ["assets/products/longsleeve-grey-1.png", "assets/products/longsleeve-grey-2.png", "assets/products/longsleeve-grey-3.png"],
    specs: ["Матеріал: бавовна", "Крій: regular", "Колір: сірий"],
    sizes: [
      { size: "S", quantity: 12 },
      { size: "M", quantity: 14 },
      { size: "L", quantity: 16 },
      { size: "XL", quantity: 18 },
    ],
    is_popular: false,
    is_active: true,
  },
  {
    id: 6,
    name: "Urban Jacket Black",
    slug: "urban-jacket-black",
    category: "jackets",
    category_name: "Куртки",
    price: 2899,
    old_price: 0,
    brand: "UrbanWear",
    description: "Легка чорна міська куртка з лаконічним силуетом.",
    short_description: "Чорна міська куртка для мінливої погоди.",
    main_image: "assets/products/hoodie-black-2.png",
    images: ["assets/products/hoodie-black-2.png"],
    specs: ["Матеріал: водовідштовхувальний текстиль", "Крій: regular", "Колір: чорний"],
    sizes: [
      { size: "S", quantity: 13 },
      { size: "M", quantity: 15 },
      { size: "L", quantity: 17 },
      { size: "XL", quantity: 19 },
    ],
    is_popular: false,
    is_active: true,
  },
  {
    id: 7,
    name: "Crossbody Bag Black",
    slug: "crossbody-bag-black",
    category: "accessories",
    category_name: "Аксесуари",
    price: 1099,
    old_price: 0,
    brand: "UrbanWear",
    description: "Компактна crossbody сумка для телефону, документів і щоденних дрібниць.",
    short_description: "Чорна crossbody сумка для міста.",
    main_image: "assets/products/crossbody-bag-1.png",
    images: ["assets/products/crossbody-bag-1.png", "assets/products/crossbody-bag-2.png", "assets/products/crossbody-bag-3.png"],
    specs: ["Матеріал: технічний текстиль", "Крій: регульований ремінь", "Колір: чорний"],
    sizes: [{ size: "One size", quantity: 20 }],
    is_popular: false,
    is_active: true,
  },
  {
    id: 8,
    name: "Cap Black",
    slug: "cap-black",
    category: "accessories",
    category_name: "Аксесуари",
    price: 699,
    old_price: 0,
    brand: "UrbanWear",
    description: "Чорна кепка з мінімалістичною посадкою та регулюванням об'єму.",
    short_description: "Базова чорна кепка для щоденного образу.",
    main_image: "assets/products/cap-black-1.png",
    images: ["assets/products/cap-black-1.png", "assets/products/cap-black-2.png", "assets/products/cap-black-3.png"],
    specs: ["Матеріал: бавовна", "Крій: adjustable", "Колір: чорний"],
    sizes: [{ size: "One size", quantity: 24 }],
    is_popular: false,
    is_active: true,
  },
];

function cloneStoreData(data) {
  return JSON.parse(JSON.stringify(data));
}

function readDemoValue(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return cloneStoreData(fallback);
  }
}

function writeDemoValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function getDemoCategories() {
  return readDemoValue(DEMO_CATEGORIES_KEY, demoInitialCategories);
}

function saveDemoCategories(categories) {
  return writeDemoValue(DEMO_CATEGORIES_KEY, categories);
}

function getDemoProducts() {
  return readDemoValue(DEMO_PRODUCTS_KEY, demoInitialProducts);
}

function saveDemoProducts(items) {
  const categories = getDemoCategories();
  const normalized = items.map((product) => {
    const category = categories.find((entry) => entry.slug === product.category);
    return { ...product, category_name: category?.name || product.category_name || product.category };
  });
  writeDemoValue(DEMO_PRODUCTS_KEY, normalized);
  hydrateStoreData(normalized, categories);
  return normalized;
}

function getDemoOrders() {
  return readDemoValue(DEMO_API_ORDERS_KEY, []);
}

function saveDemoOrders(orders) {
  return writeDemoValue(DEMO_API_ORDERS_KEY, orders);
}

function addDemoAudit(action, entityType = "demo", entityId = "") {
  const logs = readDemoValue(DEMO_AUDIT_KEY, []);
  logs.unshift({
    id: Date.now(),
    created_at: new Date().toISOString(),
    action,
    actor_type: "demo",
    actor_id: "local",
    entity_type: entityType,
    entity_id: entityId,
    ip_address: "local",
  });
  writeDemoValue(DEMO_AUDIT_KEY, logs.slice(0, 60));
}

function formatStorePrice(value) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function mapApiProduct(product) {
  const quantities = Object.fromEntries((product.sizes || []).map((entry) => [entry.size, entry.quantity]));
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    name: product.name,
    category: product.category,
    categoryTitle: product.category_name,
    imageLabel: product.category_name,
    price: formatStorePrice(product.price),
    priceValue: product.price,
    comparePrice: product.old_price ? formatStorePrice(product.old_price) : "",
    shortDescription: product.short_description || product.description,
    description: product.description,
    brand: product.brand,
    images: product.images || [],
    mainImage: product.main_image,
    specs: product.specs || [],
    sizes: (product.sizes || []).filter((entry) => entry.quantity > 0).map((entry) => entry.size),
    sizeStock: quantities,
    stock: Object.values(quantities).reduce((sum, value) => sum + Number(value || 0), 0),
    isPopular: Boolean(product.is_popular),
    isVisible: Boolean(product.is_active),
    visual: "linear-gradient(135deg, #171717, #777777)",
  };
}

var storeData = {
  settings: {
    brandName: "UrbanWear",
    heroKicker: "Нова колекція UrbanWear",
    heroTitle: "Стильний одяг для ритму міста",
    heroText: "Базові речі та streetwear-фасони для щоденного міського стилю.",
    heroVisualText: "UrbanWear / міська колекція",
    heroImage: "assets/hero-main.png",
    footerText: "Сучасний streetwear та базовий одяг для щоденного міського стилю.",
    productNote: "Оберіть доступний розмір перед додаванням товару в кошик. Демо не надсилає дані на сервер.",
    contactIntro: "Це презентаційна демо-версія. Форма нижче працює локально, а месенджери вимкнені.",
    formIntro: "Залиште тестове повідомлення - воно не надсилається, а лише показує сценарій роботи форми.",
    formSuccessMessage: "Демо-повідомлення прийнято локально. Дані нікуди не відправлялися.",
    paymentBody: "У демо-версії оплата вимкнена. Оформлення показує сценарій замовлення без переказу коштів.",
    telegramUrl: "#demo-messenger-disabled",
    viberUrl: "#demo-messenger-disabled",
    phone: "+38 000 000 00 00",
    email: "demo@urbanwear.local",
    instagram: "@urbanwear.demo",
    schedule: "Демо-режим 24/7",
  },
  categories: {},
  products: {},
};
var products = storeData.products;

function hydrateStoreData(productList = getDemoProducts(), categoryList = getDemoCategories()) {
  storeData.categories = Object.fromEntries(
    categoryList.map((category) => [category.slug, { title: category.name, description: category.description || "" }])
  );
  storeData.products = Object.fromEntries(
    productList.filter((product) => product.is_active !== false).map((product) => [product.slug, mapApiProduct(product)])
  );
  products = storeData.products;
  return storeData;
}

function getStoreData() {
  return storeData;
}

function saveStoreData() {
  saveDemoProducts(getDemoProducts());
  return storeData;
}

function resetStoreData() {
  localStorage.removeItem(DEMO_PRODUCTS_KEY);
  localStorage.removeItem(DEMO_CATEGORIES_KEY);
  hydrateStoreData();
  return storeData;
}

function parseRequestBody(options = {}) {
  if (!options.body) return {};
  if (typeof options.body === "string") {
    try { return JSON.parse(options.body); } catch { return {}; }
  }
  return options.body;
}

function createDemoError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePath(path) {
  return String(path || "").replace(/^https?:\/\/[^/]+/i, "");
}

function getNextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
}

function createOrderFromPayload(payload) {
  const productList = getDemoProducts();
  const items = (payload.items || []).map((item) => {
    const product = productList.find((entry) => Number(entry.id) === Number(item.product_id) || entry.slug === item.product_id);
    return {
      product_id: product?.id || item.product_id,
      product_slug: product?.slug || item.product_id,
      product_name: product?.name || "UrbanWear demo item",
      selected_size: item.selected_size || "",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || product?.price || 0),
    };
  });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    id: Date.now(),
    number: `UW-DEMO-${String(Date.now()).slice(-6)}`,
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: payload.customer_name || "Demo Customer",
    customer_email: payload.customer_email || "",
    customer_phone: payload.customer_phone || "",
    customer_city: payload.customer_city || "",
    delivery_service: payload.delivery_service || "Демо-доставка",
    delivery_office: payload.delivery_office || "",
    comment: payload.comment || "",
    total_price: total,
    payment_method: "cod",
    payment_status: "cod",
    payment_provider: "demo",
    payment_id: "",
    tracking_number: "",
    tracking_status: "Демо-замовлення створене локально.",
    items,
  };
}

function adminProductPayloadToApiProduct(payload, existing = {}) {
  const categories = getDemoCategories();
  const category = categories.find((entry) => entry.slug === (payload.category || existing.category)) || categories[0];
  const sizesSource = Array.isArray(payload.sizes) ? payload.sizes : existing.sizes || [];
  const images = Array.isArray(payload.images) ? payload.images.filter(Boolean) : existing.images || [];
  const specs = Array.isArray(payload.specs)
    ? payload.specs
    : String(payload.specs || existing.specs?.join("\n") || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  return {
    ...existing,
    id: existing.id || payload.id,
    name: payload.name || existing.name || "Demo product",
    slug: payload.slug || existing.slug || `demo-product-${Date.now()}`,
    category: category.slug,
    category_name: category.name,
    price: Number(payload.price ?? existing.price ?? 0),
    old_price: Number(payload.old_price ?? existing.old_price ?? 0),
    brand: payload.brand || existing.brand || "UrbanWear",
    description: payload.description || existing.description || "",
    short_description: payload.short_description || existing.short_description || payload.description || "",
    main_image: images[0] || existing.main_image || "",
    images,
    specs,
    sizes: sizesSource.map((entry) => ({
      size: entry.size || entry.name || String(entry),
      quantity: Number(entry.quantity ?? entry.stock ?? 10),
    })),
    is_popular: Boolean(payload.is_popular ?? existing.is_popular),
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : existing.is_active !== false,
  };
}

async function apiRequest(path, options = {}) {
  const requestPath = normalizePath(path);
  const url = new URL(requestPath, window.location.origin);
  const method = String(options.method || "GET").toUpperCase();
  const body = parseRequestBody(options);
  const productList = getDemoProducts();
  const categoryList = getDemoCategories();

  if (requestPath === "/api/config") {
    return {
      payment: { provider: "demo", enabled: false },
      delivery: { nova_poshta: false, ukrposhta: false },
      demo: true,
    };
  }

  if (requestPath === "/api/products" && method === "GET") {
    return productList.filter((product) => product.is_active !== false);
  }

  if (requestPath.startsWith("/api/products/") && method === "GET") {
    const slug = decodeURIComponent(requestPath.split("/").pop());
    const product = productList.find((entry) => entry.slug === slug && entry.is_active !== false);
    if (!product) throw createDemoError("Товар не знайдено у демо-каталозі.", 404);
    return product;
  }

  if (requestPath === "/api/categories" && method === "GET") {
    return categoryList;
  }

  if (requestPath.startsWith("/api/delivery/nova-poshta/cities")) {
    const search = url.searchParams.get("search") || "";
    const cities = [
      { name: "Київ", ref: "demo-kyiv" },
      { name: "Львів", ref: "demo-lviv" },
      { name: "Одеса", ref: "demo-odesa" },
      { name: "Дніпро", ref: "demo-dnipro" },
    ];
    return cities.filter((city) => city.name.toLowerCase().includes(search.toLowerCase()) || search.length < 2);
  }

  if (requestPath.startsWith("/api/delivery/nova-poshta/warehouses")) {
    return [
      { name: "Відділення N1, центральне", category: "branch" },
      { name: "Відділення N12, ТЦ Місто", category: "branch" },
      { name: "Поштомат N44, демо-локація", category: "postomat" },
    ];
  }

  if (requestPath.startsWith("/api/delivery/ukrposhta/offices")) {
    return [
      { postcode: "01001", name: "Укрпошта N1", address: "Демо-вулиця, 1" },
      { postcode: "79000", name: "Укрпошта N7", address: "Проспект Демо, 12" },
    ];
  }

  if (requestPath === "/api/orders" && method === "POST") {
    const order = createOrderFromPayload(body);
    saveDemoOrders([order, ...getDemoOrders()]);
    addDemoAudit("create_demo_order", "order", order.id);
    return { message: "Демо-замовлення створено локально.", order, payment: null };
  }

  if (requestPath === "/api/account/login" && method === "POST") {
    return { customer: { id: "demo-customer", name: body.email?.split("@")[0] || "Demo Customer", email: body.email || "demo@urbanwear.local" } };
  }

  if (requestPath === "/api/account/register" && method === "POST") {
    return { customer: { id: "demo-customer", name: body.name || "Demo Customer", email: body.email || "demo@urbanwear.local" } };
  }

  if (requestPath === "/api/account/me" && method === "GET") {
    const session = window.UrbanWearAuth?.getSession?.() || {};
    const profile = window.UrbanWearProfile?.getProfile?.(session) || {};
    return { id: session.id || "demo-customer", name: session.name || "Demo Customer", email: session.email || "demo@urbanwear.local", profile };
  }

  if (requestPath === "/api/account/profile" && method === "PATCH") {
    return { message: "Демо-профіль збережено локально." };
  }

  if (requestPath === "/api/account/password" && method === "PATCH") {
    return { message: "У демо-версії пароль не змінюється на сервері." };
  }

  if (requestPath === "/api/account/orders" && method === "GET") {
    return getDemoOrders();
  }

  if (/^\/api\/account\/orders\/.+\/tracking$/.test(requestPath)) {
    const orderId = decodeURIComponent(requestPath.split("/")[4]);
    const order = getDemoOrders().find((entry) => String(entry.id) === orderId);
    return {
      order: order || { id: orderId, tracking_status: "Демо-відстеження доступне тільки локально.", items: [] },
      tracking: { Status: "Демо-статус: замовлення готується до відправки." },
    };
  }

  if (requestPath === "/api/admin/login" && method === "POST") {
    return { message: "Вхід у демо-адмінку виконано.", admin: { email: body.email || "admin@demo.local" } };
  }

  if (requestPath === "/api/admin/password" && method === "PATCH") {
    addDemoAudit("change_demo_password", "admin", "local");
    return { message: "Демо-пароль не змінюється на сервері." };
  }

  if (requestPath === "/api/admin/products" && method === "GET") {
    return productList;
  }

  if (requestPath === "/api/admin/categories" && method === "GET") {
    return categoryList;
  }

  if (requestPath === "/api/admin/orders" && method === "GET") {
    return getDemoOrders();
  }

  if (requestPath.startsWith("/api/admin/audit-logs") && method === "GET") {
    return readDemoValue(DEMO_AUDIT_KEY, []);
  }

  if (requestPath === "/api/admin/categories" && method === "POST") {
    const categories = getDemoCategories();
    const category = { id: getNextId(categories), name: body.name || "Демо-категорія", slug: body.slug || `demo-category-${Date.now()}`, description: body.description || "" };
    saveDemoCategories([...categories, category]);
    hydrateStoreData();
    addDemoAudit("create_demo_category", "category", category.id);
    return category;
  }

  if (/^\/api\/admin\/categories\/\d+$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").pop());
    const categories = getDemoCategories();
    const updated = categories.map((category) => category.id === id ? { ...category, ...body, id } : category);
    saveDemoCategories(updated);
    hydrateStoreData();
    addDemoAudit("update_demo_category", "category", id);
    return updated.find((category) => category.id === id);
  }

  if (requestPath === "/api/admin/products" && method === "POST") {
    const productsToSave = getDemoProducts();
    const product = adminProductPayloadToApiProduct({ ...body, id: getNextId(productsToSave) });
    saveDemoProducts([...productsToSave, product]);
    addDemoAudit("create_demo_product", "product", product.id);
    return product;
  }

  if (/^\/api\/admin\/products\/\d+$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").pop());
    const productsToSave = getDemoProducts();
    const updated = productsToSave.map((product) => product.id === id ? adminProductPayloadToApiProduct(body, product) : product);
    saveDemoProducts(updated);
    addDemoAudit("update_demo_product", "product", id);
    return updated.find((product) => product.id === id);
  }

  if (/^\/api\/admin\/products\/\d+$/.test(requestPath) && method === "DELETE") {
    const id = Number(requestPath.split("/").pop());
    const updated = getDemoProducts().map((product) => product.id === id ? { ...product, is_active: false } : product);
    saveDemoProducts(updated);
    addDemoAudit("hide_demo_product", "product", id);
    return { message: "Демо-товар приховано локально." };
  }

  if (/^\/api\/admin\/products\/\d+\/restore$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").at(-2));
    const updated = getDemoProducts().map((product) => product.id === id ? { ...product, is_active: true } : product);
    saveDemoProducts(updated);
    addDemoAudit("restore_demo_product", "product", id);
    return updated.find((product) => product.id === id);
  }

  if (/^\/api\/admin\/orders\/\d+\/status$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").at(-2));
    const updated = getDemoOrders().map((order) => order.id === id ? { ...order, status: body.status || order.status } : order);
    saveDemoOrders(updated);
    addDemoAudit("update_demo_order_status", "order", id);
    return updated.find((order) => order.id === id);
  }

  if (/^\/api\/admin\/orders\/\d+\/payment$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").at(-2));
    const updated = getDemoOrders().map((order) => order.id === id ? { ...order, payment_status: body.payment_status || order.payment_status } : order);
    saveDemoOrders(updated);
    addDemoAudit("update_demo_payment_status", "order", id);
    return updated.find((order) => order.id === id);
  }

  if (/^\/api\/admin\/orders\/\d+\/tracking$/.test(requestPath) && method === "PATCH") {
    const id = Number(requestPath.split("/").at(-2));
    const updated = getDemoOrders().map((order) => order.id === id ? { ...order, tracking_number: body.tracking_number || "", tracking_status: "Демо-ТТН збережено локально." } : order);
    saveDemoOrders(updated);
    addDemoAudit("update_demo_tracking", "order", id);
    return updated.find((order) => order.id === id);
  }

  return { message: "Демо-режим: запит оброблено локально.", demo: true };
}

async function loadStoreData() {
  hydrateStoreData();
  window.dispatchEvent(new CustomEvent("urbanwear:store-ready"));
  return storeData;
}

window.UrbanWearStore = {
  api: apiRequest,
  mapProduct: mapApiProduct,
  error: null,
  ready: loadStoreData(),
  getStoreData,
  saveStoreData,
  resetStoreData,
};
