const URBANWEAR_ANALYTICS_KEY = "urbanwear-analytics";

function analyticsAllowed() {
  return Boolean(window.UrbanWearCookies?.getConsent()?.analytics);
}

function getAnalyticsData() {
  try {
    const savedData = localStorage.getItem(URBANWEAR_ANALYTICS_KEY);
    return savedData
      ? JSON.parse(savedData)
      : {
          events: [],
        };
  } catch (error) {
    return { events: [] };
  }
}

function saveAnalyticsData(data) {
  if (!analyticsAllowed()) return;
  localStorage.setItem(URBANWEAR_ANALYTICS_KEY, JSON.stringify(data));
}

function trackAnalyticsEvent(type, payload = {}) {
  if (!analyticsAllowed()) return;
  const data = getAnalyticsData();

  data.events.push({
    type,
    payload,
    path: window.location.pathname.split("/").pop() || "index.html",
    timestamp: new Date().toISOString(),
  });

  if (data.events.length > 500) {
    data.events = data.events.slice(-500);
  }

  saveAnalyticsData(data);
}

function countBy(events, getKey) {
  return events.reduce((result, event) => {
    const key = getKey(event) || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function getAnalyticsSummary(products = {}) {
  const data = getAnalyticsData();
  const events = data.events || [];
  const productViews = countBy(
    events.filter((event) => event.type === "product-view"),
    (event) => event.payload.productId
  );
  const cartAdds = countBy(
    events.filter((event) => event.type === "cart-add"),
    (event) => event.payload.productId
  );
  const pageVisits = countBy(
    events.filter((event) => event.type === "page-view"),
    (event) => event.path
  );
  const linkClicks = countBy(
    events.filter((event) => event.type === "link-click"),
    (event) => event.payload.label || event.payload.href
  );

  return {
    events,
    totalVisits: events.filter((event) => event.type === "page-view").length,
    totalLinkClicks: events.filter((event) => event.type === "link-click").length,
    totalCartAdds: events.filter((event) => event.type === "cart-add").length,
    pageVisits,
    linkClicks,
    productViews,
    cartAdds,
    productRows: Object.entries(products).map(([id, product]) => ({
      id,
      title: product.title,
      price: product.price,
      isPopular: product.isPopular,
      views: productViews[id] || 0,
      cartAdds: cartAdds[id] || 0,
    })),
  };
}

function resetAnalytics() {
  saveAnalyticsData({ events: [] });
}

window.UrbanWearAnalytics = {
  track: trackAnalyticsEvent,
  getData: getAnalyticsData,
  getSummary: getAnalyticsSummary,
  reset: resetAnalytics,
};

document.addEventListener("DOMContentLoaded", () => {
  trackAnalyticsEvent("page-view", {
    title: document.title,
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (!link) {
      return;
    }

    trackAnalyticsEvent("link-click", {
      href: link.getAttribute("href"),
      label: link.textContent.trim(),
    });
  });
});

window.addEventListener("urbanwear:cookie-consent", (event) => {
  if (event.detail?.analytics) {
    trackAnalyticsEvent("page-view", { title: document.title, source: "consent" });
  } else {
    localStorage.removeItem(URBANWEAR_ANALYTICS_KEY);
  }
});
