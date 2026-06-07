const URBANWEAR_FAVORITES_KEY = "urbanwear-favorites";

function getFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(URBANWEAR_FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(URBANWEAR_FAVORITES_KEY, JSON.stringify([...new Set(favorites)]));
  updateFavoritesUI();
}

function isFavorite(productId) {
  return getFavorites().includes(productId);
}

function toggleFavorite(productId) {
  const favorites = getFavorites();
  const next = favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
  saveFavorites(next);
  return next.includes(productId);
}

function clearFavorites() {
  saveFavorites([]);
}

function updateFavoritesUI() {
  const favorites = getFavorites();
  document.querySelectorAll("[data-favorites-count]").forEach((badge) => {
    badge.textContent = String(favorites.length);
  });
  document.querySelectorAll("[data-favorite-product]").forEach((button) => {
    const active = favorites.includes(button.dataset.favoriteProduct);
    button.classList.toggle("is-favorite", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Видалити з обраного" : "Додати в обране");
    const label = button.querySelector("[data-favorite-label]");
    if (label) label.textContent = active ? "В обраному" : "В обране";
  });
}

document.addEventListener("DOMContentLoaded", updateFavoritesUI);
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-product]");
  if (!button) return;
  event.preventDefault();
  toggleFavorite(button.dataset.favoriteProduct);
  document.dispatchEvent(new CustomEvent("urbanwear:favorites-changed"));
});

window.UrbanWearFavorites = {
  getFavorites,
  isFavorite,
  toggleFavorite,
  clearFavorites,
  updateFavoritesUI,
};
