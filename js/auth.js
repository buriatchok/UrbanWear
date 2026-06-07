const URBANWEAR_USERS_KEY = "urbanwear-users";
const URBANWEAR_SESSION_KEY = "urbanwear-session";

const defaultUsers = [
  {
    id: "admin-default",
    name: "Admin",
    email: "admin@urbanwear.local",
    password: "admin123",
    role: "admin",
    provider: "password",
  },
  {
    id: "customer-default",
    name: "Customer",
    email: "customer@urbanwear.local",
    password: "customer123",
    role: "customer",
    provider: "password",
  },
];

function getUsers() {
  try {
    const savedUsers = localStorage.getItem(URBANWEAR_USERS_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [...defaultUsers];
  } catch (error) {
    return [...defaultUsers];
  }
}

function saveUsers(users) {
  localStorage.setItem(URBANWEAR_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    const savedSession = localStorage.getItem(URBANWEAR_SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  } catch (error) {
    return null;
  }
}

function setSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(URBANWEAR_SESSION_KEY, JSON.stringify(session));
  return session;
}

function login(email, password, expectedRole) {
  const user = getUsers().find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      (!expectedRole || item.role === expectedRole)
  );

  if (!user) {
    throw new Error("Невірний email, пароль або роль користувача.");
  }

  return setSession(user);
}

function registerCustomer({ name, email, password }) {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("Користувач з таким email вже існує.");
  }

  const user = {
    id: `customer-${Date.now()}`,
    name,
    email: normalizedEmail,
    password,
    role: "customer",
    provider: "password",
  };

  users.push(user);
  saveUsers(users);
  return setSession(user);
}

function socialLogin(provider) {
  const users = getUsers();
  const normalizedProvider = provider.toLowerCase();
  const email = `${normalizedProvider}-customer@urbanwear.local`;
  let user = users.find((item) => item.email === email);

  if (!user) {
    user = {
      id: `${normalizedProvider}-${Date.now()}`,
      name: `${provider} Customer`,
      email,
      password: "",
      role: "customer",
      provider,
    };
    users.push(user);
    saveUsers(users);
  }

  return setSession(user);
}

function logout() {
  localStorage.removeItem(URBANWEAR_SESSION_KEY);
}

function requireRole(role) {
  const session = getSession();
  return Boolean(session && session.role === role);
}

window.UrbanWearAuth = {
  getUsers,
  saveUsers,
  getSession,
  login,
  registerCustomer,
  socialLogin,
  logout,
  requireRole,
};
