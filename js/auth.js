const URBANWEAR_SESSION_KEY = "urbanwear-session";
const URBANWEAR_CUSTOMER_TOKEN_KEY = "urbanwear-customer-token";
const URBANWEAR_ADMIN_TOKEN_KEY = "urbanwear-admin-token";
const URBANWEAR_ADMIN_SESSION_KEY = "urbanwear-admin-active";

// Remove legacy bearer tokens. Authentication now uses HttpOnly cookies.
localStorage.removeItem(URBANWEAR_CUSTOMER_TOKEN_KEY);
localStorage.removeItem(URBANWEAR_ADMIN_TOKEN_KEY);

function getSession() {
  try { return JSON.parse(localStorage.getItem(URBANWEAR_SESSION_KEY) || "null"); }
  catch { return null; }
}

function setSession(user) {
  const session = { id: user.id, name: user.name, email: user.email, role: "customer", provider: "password" };
  localStorage.setItem(URBANWEAR_SESSION_KEY, JSON.stringify(session));
  return session;
}

function getCustomerToken() {
  return getSession() ? "http-only-cookie" : "";
}

function customerHeaders() {
  return {};
}

async function login(email, password) {
  const result = await window.UrbanWearStore.api("/api/account/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return setSession(result.customer);
}

async function registerCustomer({ name, email, password, legalConsent }) {
  const result = await window.UrbanWearStore.api("/api/account/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, legal_consent: legalConsent === true }),
  });
  return setSession(result.customer);
}

function socialLogin() {
  return setSession({ id: "demo-social", name: "Demo Customer", email: "demo@urbanwear.local" });
}

function logout() {
  localStorage.removeItem(URBANWEAR_SESSION_KEY);
  localStorage.removeItem(URBANWEAR_CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(URBANWEAR_ADMIN_TOKEN_KEY);
  localStorage.removeItem(URBANWEAR_ADMIN_SESSION_KEY);
}

function getAdminToken() {
  return "";
}

function getAdminSession() {
  return localStorage.getItem(URBANWEAR_ADMIN_SESSION_KEY) === "1";
}

async function adminLogin(email, password) {
  const result = await window.UrbanWearStore.api("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(URBANWEAR_ADMIN_SESSION_KEY, "1");
  return result;
}

function requireRole(role) {
  return role === "admin" ? getAdminSession() : getSession()?.role === role;
}

function adminHeaders() {
  return {};
}

window.UrbanWearAuth = {
  getSession, login, registerCustomer, socialLogin, logout, requireRole,
  getCustomerToken, customerHeaders, getAdminToken, getAdminSession, adminLogin, adminHeaders,
};
