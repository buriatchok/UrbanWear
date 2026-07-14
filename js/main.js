window.UrbanWearStore.ready.then(() => {
const activeStoreData =
  typeof storeData !== "undefined" ? storeData : { settings: {}, products: {} };
const storeSettings = activeStoreData.settings || {};
const activeCategories = activeStoreData.categories || {};
const activeProducts =
  typeof products !== "undefined" ? products : activeStoreData.products || {};
const publicProducts = Object.fromEntries(
  Object.entries(activeProducts).filter(([, product]) => product.isVisible !== false)
);

const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function getProductImages(product) {
  return Array.isArray(product && product.images) ? product.images.filter(Boolean) : [];
}

function getPrimaryProductImage(product) {
  return getProductImages(product)[0] || "";
}

function createProductImageStyle(product) {
  const primaryImage = getPrimaryProductImage(product);

  return primaryImage
    ? `background-image: url('${escapeAttribute(primaryImage)}');`
    : `--product-bg: ${escapeAttribute(product.visual)};`;
}

function renderHeaderControls() {
  document.querySelectorAll(".header__inner").forEach((header) => {
    if (header.querySelector(".header-actions")) {
      return;
    }

    const session = window.UrbanWearAuth ? window.UrbanWearAuth.getSession() : null;
    const primaryButton = header.querySelector(".header__btn");
    const actions = document.createElement("div");

    actions.className = "header-actions";

    if (primaryButton) {
      actions.append(primaryButton);
    }

    actions.insertAdjacentHTML(
      "beforeend",
      `
        <a href="account.html?tab=favorites" class="header-icon-link header-icon-link--favorites">Обране <span data-favorites-count>0</span></a>
        <a href="account.html?tab=cart" class="header-icon-link header-icon-link--cart">Кошик <span data-cart-count>0</span></a>
        ${
          session
            ? `<a href="account.html" class="header-icon-link header-icon-link--profile">${escapeHtml(session.name)}</a>`
            : '<a href="auth.html" class="header-icon-link header-icon-link--profile">Увійти</a>'
        }
      `
    );

    header.append(actions);

    const mobileShortcuts = document.createElement("div");
    mobileShortcuts.className = "mobile-header-shortcuts";
    mobileShortcuts.innerHTML = `
      <a href="account.html?tab=favorites" class="mobile-header-shortcut mobile-header-shortcut--favorites" aria-label="Обране"><span data-favorites-count>0</span></a>
      <a href="account.html?tab=cart" class="mobile-header-shortcut mobile-header-shortcut--cart" aria-label="Кошик"><span data-cart-count>0</span></a>
      <a href="${session ? "account.html" : "auth.html"}" class="mobile-header-shortcut mobile-header-shortcut--profile" aria-label="Профіль"></a>
    `;
    header.append(mobileShortcuts);
  });
}

function renderMobileBottomNav() {
  if (document.querySelector(".mobile-bottom-nav")) {
    return;
  }

  const session = window.UrbanWearAuth ? window.UrbanWearAuth.getSession() : null;
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const currentTab = new URLSearchParams(window.location.search).get("tab");
  const customerAccount = session?.role === "customer";
  const favoritesHref = "account.html?tab=favorites";
  const cartHref = "account.html?tab=cart";
  const profileHref = session ? "account.html" : "auth.html";
  const nav = document.createElement("nav");

  nav.className = "mobile-bottom-nav";
  nav.setAttribute("aria-label", "Мобільна навігація");
  nav.innerHTML = `
    <a href="index.html" class="mobile-bottom-nav__item mobile-bottom-nav__item--home ${currentPage === "index.html" ? "is-active" : ""}">
      <span class="mobile-bottom-nav__icon"></span><span>Головна</span>
    </a>
    <a href="catalog.html" class="mobile-bottom-nav__item mobile-bottom-nav__item--catalog ${currentPage === "catalog.html" || currentPage === "product.html" ? "is-active" : ""}">
      <span class="mobile-bottom-nav__icon"></span><span>Каталог</span>
    </a>
    <a href="${favoritesHref}" class="mobile-bottom-nav__item mobile-bottom-nav__item--favorites ${currentPage === "account.html" && currentTab === "favorites" ? "is-active" : ""}">
      <span class="mobile-bottom-nav__icon"></span><span>Обране</span><b data-favorites-count>0</b>
    </a>
    <a href="${cartHref}" class="mobile-bottom-nav__item mobile-bottom-nav__item--cart ${currentPage === "account.html" && currentTab === "cart" ? "is-active" : ""}">
      <span class="mobile-bottom-nav__icon"></span><span>Кошик</span><b data-cart-count>0</b>
    </a>
    <a href="${profileHref}" class="mobile-bottom-nav__item mobile-bottom-nav__item--profile ${currentPage === "account.html" && !currentTab ? "is-active" : ""}">
      <span class="mobile-bottom-nav__icon"></span><span>Профіль</span>
    </a>
  `;

  document.body.append(nav);
}

function applyHeroImage() {
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero__photo-placeholder");

  if (!hero || !heroImage) {
    return;
  }

  const image = storeSettings.heroImage || "";

  if (image) {
    const resolvedImage = image.startsWith("data:") ? image : new URL(image, document.baseURI).href;
    const safeImage = resolvedImage.replaceAll('"', '\\"');
    hero.style.setProperty("--mobile-hero-image", `url("${safeImage}")`);
    heroImage.style.backgroundImage = `url("${safeImage}")`;
    hero.classList.add("hero--has-mobile-image");
    heroImage.classList.add("hero__photo-placeholder--image");
  }
}

function applyStoreSettings() {
  document.querySelectorAll(".logo").forEach((logo) => {
    logo.textContent = storeSettings.brandName || "UrbanWear";
  });

  document.querySelectorAll("[data-store-text]").forEach((element) => {
    const key = element.dataset.storeText;

    if (storeSettings[key]) {
      element.textContent = storeSettings[key];
    }
  });

  document.querySelectorAll("[data-store-href]").forEach((element) => {
    const key = element.dataset.storeHref;

    if (storeSettings[key]) {
      element.setAttribute("href", storeSettings[key]);
    }
  });
}

applyStoreSettings();
renderHeaderControls();
renderMobileBottomNav();
applyHeroImage();

if (burger && nav) {
  burger.setAttribute("aria-expanded", "false");

  burger.addEventListener("click", () => {
    const isOpen = burger.classList.toggle("is-open");

    nav.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burger.classList.remove("is-open");
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

function createProductCard(productId, product) {
  const productUrl = `product.html?slug=${encodeURIComponent(productId)}`;
  const hasPhoto = Boolean(getPrimaryProductImage(product));

  return `
    <article class="product-card" data-category="${escapeAttribute(product.category)}">
      <button class="product-favorite-button" type="button" data-favorite-product="${escapeAttribute(productId)}" aria-label="Додати в обране">♡</button>
      <a
        class="product-card__image ${hasPhoto ? "product-card__image--photo" : ""}"
        href="${productUrl}"
        style="${createProductImageStyle(product)}"
        aria-label="Переглянути ${escapeAttribute(product.title)}"
      >
        <span>${escapeHtml(product.imageLabel)}</span>
      </a>

      <div class="product-card__body">
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.shortDescription)}</p>
        <strong>${escapeHtml(product.price)}</strong>
        <div class="product-card__actions">
          <a href="${productUrl}" class="product-card__btn">Детальніше</a>
          <button
            class="product-card__btn product-card__btn--light"
            type="button"
            data-add-to-cart="${escapeAttribute(productId)}"
            data-default-text="Обрати розмір"
          >
            Обрати розмір
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderStoreCategories() {
  const categoryEntries = Object.entries(activeCategories);
  const catalogFilter = document.getElementById("catalogCategoryFilter");
  const categoryGrid = document.getElementById("storeCategoryGrid");
  const homeCategoryTabs = document.getElementById("homeCategoryTabs");
  const categoryDots = document.getElementById("categoryDots");

  if (catalogFilter) {
    catalogFilter.innerHTML = `
      <button class="filter-btn active" type="button" data-filter="all" aria-pressed="true">Усі</button>
      ${categoryEntries
        .map(
          ([slug, category]) =>
            `<button class="filter-btn" type="button" data-filter="${escapeAttribute(slug)}" aria-pressed="false">${escapeHtml(category.title)}</button>`
        )
        .join("")}
    `;
  }

  if (homeCategoryTabs) {
    homeCategoryTabs.innerHTML = `
      <button class="category-tab is-active" type="button" data-category-slide="all">Усі</button>
      ${categoryEntries
        .map(
          ([slug, category]) =>
            `<button class="category-tab" type="button" data-category-slide="${escapeAttribute(slug)}">${escapeHtml(category.title)}</button>`
        )
        .join("")}
    `;
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = categoryEntries
      .map(
        ([slug, category], index) => {
          const categoryProduct = Object.values(publicProducts).find((product) => product.category === slug) || {};
          const categoryImage = getPrimaryProductImage(categoryProduct);
          const fallbackImage = slug === "hoodies" ? "assets/mobile-hero-model.png" : "";
          const image = categoryImage || fallbackImage;
          const imageStyle = image
            ? `background-image:url('${escapeAttribute(image)}');`
            : `--category-bg:${escapeAttribute(categoryProduct.visual || "linear-gradient(135deg,#e7e0d6,#b8ada0)")};`;
          return `
          <a href="catalog.html?category=${encodeURIComponent(slug)}" class="category-card category-slide" data-category-slug="${escapeAttribute(slug)}">
            <div class="category-slide__image" style="${imageStyle}">
              <span class="category-slide__number">${String(index + 1).padStart(2, "0")}</span>
              <span class="category-slide__visual-label">${escapeHtml(categoryProduct.imageLabel || category.title)}</span>
            </div>
            <div class="category-slide__content">
              <div>
                <h3>${escapeHtml(category.title)}</h3>
                <p>${escapeHtml(category.description || "Перегляньте товари цієї категорії.")}</p>
              </div>
              <span class="category-slide__arrow" aria-hidden="true">→</span>
            </div>
          </a>
        `;
        }
      )
      .join("");
  }

  if (categoryDots) {
    categoryDots.innerHTML = categoryEntries
      .map(([, category], index) => `<button class="category-dot ${index === 0 ? "is-active" : ""}" type="button" data-category-dot="${index}" aria-label="${escapeAttribute(category.title)}"></button>`)
      .join("");
  }

  if (categoryGrid && homeCategoryTabs && categoryDots) {
    const slides = [...categoryGrid.querySelectorAll(".category-slide")];
    const tabs = [...homeCategoryTabs.querySelectorAll(".category-tab")];
    const dots = [...categoryDots.querySelectorAll(".category-dot")];

    const setActiveCategory = (index) => {
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.categorySlide === (slides[index]?.dataset.categorySlug || "all")));
    };

    const scrollToSlide = (index) => {
      const slide = slides[index];
      if (!slide) return;
      categoryGrid.scrollTo({ left: slide.offsetLeft - categoryGrid.offsetLeft, behavior: "smooth" });
      setActiveCategory(index);
    };

    let categoryScrollFrame = 0;
    categoryGrid.addEventListener("scroll", () => {
      cancelAnimationFrame(categoryScrollFrame);
      categoryScrollFrame = requestAnimationFrame(() => {
        const index = slides.reduce((closestIndex, slide, slideIndex) => {
          const closest = slides[closestIndex];
          return Math.abs(slide.offsetLeft - categoryGrid.scrollLeft) < Math.abs(closest.offsetLeft - categoryGrid.scrollLeft)
            ? slideIndex
            : closestIndex;
        }, 0);
        setActiveCategory(index);
      });
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.dataset.categorySlide === "all") scrollToSlide(0);
        else scrollToSlide(slides.findIndex((slide) => slide.dataset.categorySlug === tab.dataset.categorySlide));
      });
    });
    dots.forEach((dot) => dot.addEventListener("click", () => scrollToSlide(Number(dot.dataset.categoryDot))));
  }
}

renderStoreCategories();

const catalogProductsContainer = document.getElementById("catalogProducts");

if (catalogProductsContainer) {
  catalogProductsContainer.innerHTML = Object.entries(publicProducts)
    .map(([productId, product]) => createProductCard(productId, product))
    .join("") || '<p class="form-message">Активних товарів поки немає.</p>';
}

const popularProductsContainer = document.getElementById("popularProducts");

if (popularProductsContainer) {
  const popularProducts = Object.entries(publicProducts).filter(
    ([, product]) => product.isPopular === true
  );

  popularProductsContainer.innerHTML = popularProducts
    .map(([productId, product]) => createProductCard(productId, product))
    .join("") || '<p class="form-message">Популярних товарів поки немає.</p>';
}

const filterButtons = document.querySelectorAll(".filter-btn");

function getCatalogProducts() {
  return document.querySelectorAll(".product-grid--catalog .product-card");
}

if (filterButtons.length > 0) {
  const requestedCategory = new URLSearchParams(window.location.search).get("category");

  function applyCategoryFilter(selectedFilter, selectedButton) {
    const catalogProducts = getCatalogProducts();

    filterButtons.forEach((btn) => {
      const isActive = btn === selectedButton;

      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    catalogProducts.forEach((product) => {
      const productCategory = product.dataset.category;
      const isVisible = selectedFilter === "all" || selectedFilter === productCategory;

      product.hidden = !isVisible;
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyCategoryFilter(button.dataset.filter, button);
    });
  });

  const requestedButton = Array.from(filterButtons).find(
    (button) => button.dataset.filter === requestedCategory
  );
  if (requestedButton) applyCategoryFilter(requestedCategory, requestedButton);
}

const params = new URLSearchParams(window.location.search);
const productId = params.get("slug") || params.get("id");
const catalogSearch = params.get("search")?.trim().toLowerCase();
const productEntries = Object.entries(publicProducts);

if (catalogProductsContainer && catalogSearch) {
  getCatalogProducts().forEach((card) => {
    card.hidden = !card.textContent.toLowerCase().includes(catalogSearch);
  });
}

if (productEntries.length > 0 && document.getElementById("productTitle") && publicProducts[productId]) {
  const activeProductId = productId;
  const product = publicProducts[activeProductId];

  const title = document.getElementById("productTitle");
  const description = document.getElementById("productDescription");
  const price = document.getElementById("productPrice");
  const category = document.getElementById("productCategory");
  const imageLabel = document.getElementById("productImageLabel");
  const productVisual = document.getElementById("productVisual");
  const productThumbs = document.querySelector(".product-gallery__thumbs");
  const specs = document.getElementById("productSpecs");
  const sizeList = document.querySelector(".size-list");

  if (title) title.textContent = product.title;
  if (description) description.textContent = product.description;
  if (price) price.textContent = product.price;
  if (category) category.textContent = product.categoryTitle;
  if (imageLabel) imageLabel.textContent = product.imageLabel;
  if (productVisual) {
    const productImages = getProductImages(product);
    const primaryImage = productImages[0] || "";

    productVisual.classList.toggle("product-gallery__main--photo", Boolean(primaryImage));
    productVisual.style.setProperty("--product-bg", product.visual);
    productVisual.style.backgroundImage = primaryImage ? `url('${primaryImage}')` : "";
    productVisual.style.backgroundSize = primaryImage ? "contain" : "";
    productVisual.style.backgroundPosition = "center";
    productVisual.style.backgroundRepeat = "no-repeat";

    if (productThumbs && productImages.length > 0) {
      productThumbs.innerHTML = productImages
        .map(
          (image, index) => `
            <button class="product-gallery__thumb product-gallery__thumb--photo ${index === 0 ? "is-active" : ""}" type="button" data-product-image="${escapeAttribute(image)}" aria-label="Фото товару ${index + 1}" style="background-image: url('${escapeAttribute(image)}')"></button>
          `
        )
        .join("");

      productThumbs.querySelectorAll("[data-product-image]").forEach((button) => {
        button.addEventListener("click", () => {
          productVisual.style.backgroundImage = `url('${button.dataset.productImage}')`;
          productVisual.style.backgroundSize = "contain";
          productVisual.style.backgroundPosition = "center";
          productVisual.style.backgroundRepeat = "no-repeat";
          productThumbs.querySelectorAll(".product-gallery__thumb").forEach((thumb) => {
            thumb.classList.toggle("is-active", thumb === button);
          });
        });
      });
    }
  }

  if (window.UrbanWearAnalytics) {
    window.UrbanWearAnalytics.track("product-view", { productId: activeProductId });
  }

  if (specs) {
    specs.innerHTML = "";

    product.specs.forEach((spec) => {
      const li = document.createElement("li");
      li.textContent = spec;
      specs.appendChild(li);
    });
  }
  if (sizeList) {
    sizeList.innerHTML = product.sizes.length
      ? product.sizes.map((size, index) => `<button type="button" data-size="${escapeAttribute(size)}" class="${index === 0 ? "is-active" : ""}">${escapeHtml(size)}</button>`).join("")
      : '<span>Немає доступних розмірів</span>';
  }

  document.title = `${product.title} — купити в ${storeSettings.brandName || "UrbanWear"}`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `${product.title} від UrbanWear. ${product.shortDescription}. Актуальні розміри та доставка по Україні.`
    );
  }

  const relatedProductsContainer = document.getElementById("relatedProducts");

  if (relatedProductsContainer) {
    const relatedProducts = productEntries
      .filter(([id, item]) => id !== activeProductId && item.category === product.category)
      .slice(0, 3);

    const fallbackRelatedProducts = productEntries
      .filter(([id]) => id !== activeProductId)
      .slice(0, 3);

    const itemsToRender = relatedProducts.length > 0 ? relatedProducts : fallbackRelatedProducts;

    relatedProductsContainer.innerHTML = itemsToRender
      .map(([id, item]) => createProductCard(id, item))
      .join("");
  }

  const productActions = document.querySelector(".product-actions");

  if (productActions && !productActions.querySelector("[data-add-to-cart]")) {
    const cartButton = document.createElement("button");
    const buyButton = document.createElement("button");
    const favoriteButton = document.createElement("button");

    cartButton.className = "btn btn--light";
    cartButton.type = "button";
    cartButton.dataset.addToCart = activeProductId;
    cartButton.dataset.defaultText = "Додати в кошик";
    cartButton.textContent = "Додати в кошик";

    buyButton.className = "btn btn--dark";
    buyButton.type = "button";
    buyButton.dataset.buyNow = activeProductId;
    buyButton.textContent = "Купити";

    favoriteButton.className = "btn btn--favorite";
    favoriteButton.type = "button";
    favoriteButton.dataset.favoriteProduct = activeProductId;
    favoriteButton.innerHTML = '<span aria-hidden="true">♡</span><span data-favorite-label>В обране</span>';

    const telegramButton = productActions.querySelector("[data-store-href='telegramUrl']");
    productActions.insertBefore(cartButton, telegramButton);
    cartButton.insertAdjacentElement("afterend", buyButton);
    productActions.append(favoriteButton);
    window.UrbanWearFavorites?.updateFavoritesUI();
  }
}

document.querySelectorAll(".size-list button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
  });
});

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactForm.reset();
    formMessage.textContent =
      storeSettings.formSuccessMessage || "Повідомлення надіслано. Дякуємо за звернення.";
  });
}
}).catch(() => {});
