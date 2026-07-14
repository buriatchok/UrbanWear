const URBANWEAR_ORDERS_KEY = "urbanwear-orders";

function getOrders() {
  try { return JSON.parse(localStorage.getItem(URBANWEAR_ORDERS_KEY) || "[]"); }
  catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem(URBANWEAR_ORDERS_KEY, JSON.stringify(orders));
  return orders;
}
function rememberOrder(apiOrder, customerEmail = "") {
  const order = {
    id: String(apiOrder.id),
    number: apiOrder.number,
    status: apiOrder.status[0].toUpperCase() + apiOrder.status.slice(1),
    createdAt: apiOrder.created_at,
    total: apiOrder.total_price,
    customer: { name: apiOrder.customer_name, phone: apiOrder.customer_phone, email: customerEmail, city: apiOrder.customer_city },
    delivery: { method: apiOrder.delivery_service, city: apiOrder.customer_city, branch: apiOrder.delivery_office, comment: apiOrder.comment },
    payment: { method: "" },
    items: apiOrder.items.map((item) => ({ id: item.product_slug, title: item.product_name, price: item.price, quantity: item.quantity, size: item.selected_size })),
  };
  saveOrders([order, ...getOrders().filter((entry) => entry.id !== order.id)]);
  return order;
}
function mapApiOrder(apiOrder) {
  return {
    id: String(apiOrder.id),
    number: apiOrder.number,
    status: apiOrder.status[0].toUpperCase() + apiOrder.status.slice(1),
    createdAt: apiOrder.created_at,
    total: apiOrder.total_price,
    customer: {
      name: apiOrder.customer_name,
      phone: apiOrder.customer_phone,
      email: apiOrder.customer_email || "",
      city: apiOrder.customer_city,
    },
    delivery: {
      method: apiOrder.delivery_service,
      city: apiOrder.customer_city,
      branch: apiOrder.delivery_office,
      comment: apiOrder.comment,
      trackingNumber: apiOrder.tracking_number || "",
      trackingStatus: apiOrder.tracking_status || "",
    },
    payment: {
      method: apiOrder.payment_method || "",
      status: apiOrder.payment_status || "pending",
      provider: apiOrder.payment_provider || "",
    },
    items: apiOrder.items.map((item) => ({
      id: item.product_slug,
      title: item.product_name,
      price: item.price,
      quantity: item.quantity,
      size: item.selected_size,
    })),
  };
}
async function syncOrders() {
  if (!window.UrbanWearAuth?.getCustomerToken()) return getOrders();
  const orders = await window.UrbanWearStore.api("/api/account/orders", {
    headers: window.UrbanWearAuth.customerHeaders(),
  });
  return saveOrders(orders.map(mapApiOrder));
}
function getOrderSummary(orders = getOrders()) {
  return {
    totalOrders: orders.length,
    newOrders: orders.filter((order) => order.status === "New").length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
  };
}
window.UrbanWearOrders = { getOrders, saveOrders, rememberOrder, mapApiOrder, syncOrders, getOrderSummary };
