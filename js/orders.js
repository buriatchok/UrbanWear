const URBANWEAR_ORDERS_KEY = "urbanwear-orders";

function getOrders() {
  try {
    const savedOrders = localStorage.getItem(URBANWEAR_ORDERS_KEY);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(URBANWEAR_ORDERS_KEY, JSON.stringify(orders));
  return orders;
}

function createOrder(order) {
  const orders = getOrders();
  const nextOrder = {
    ...order,
    id: order.id || `order-${Date.now()}`,
    number: order.number || `UW-${String(Date.now()).slice(-6)}`,
    status: order.status || "New",
    createdAt: order.createdAt || new Date().toISOString(),
  };

  orders.unshift(nextOrder);
  saveOrders(orders);
  return nextOrder;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order
  );

  saveOrders(orders);
  return orders.find((order) => order.id === orderId) || null;
}

function deleteOrder(orderId) {
  const orders = getOrders().filter((order) => order.id !== orderId);
  saveOrders(orders);
  return orders;
}

function getOrderSummary(orders = getOrders()) {
  const customerKeys = new Set(
    orders.map((order) => order.customer && (order.customer.email || order.customer.phone)).filter(Boolean)
  );

  return {
    totalOrders: orders.length,
    newOrders: orders.filter((order) => order.status === "New").length,
    processingOrders: orders.filter((order) =>
      ["Processing", "Shipped"].includes(order.status)
    ).length,
    completedOrders: orders.filter((order) => order.status === "Completed").length,
    cancelledOrders: orders.filter((order) => order.status === "Cancelled").length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    customers: customerKeys.size,
  };
}

window.UrbanWearOrders = {
  getOrders,
  saveOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderSummary,
};
