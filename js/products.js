const URBANWEAR_STORAGE_KEY = "urbanwear-store-data";

const defaultStoreData = {
  settings: {
    brandName: "UrbanWear",
    footerText: "Адаптивний сайт-каталог сучасного одягу.",
    heroKicker: "Нова колекція 2026",
    heroTitle: "Мінімалістичний одяг для щоденного міського стилю",
    heroText:
      "Базові худі, футболки, штани та аксесуари для тих, хто обирає комфорт, чистий дизайн і впевнений streetwear без зайвого шуму.",
    heroVisualText: "Дроп 01 / міська база",
    aboutTitle: "UrbanWear - простий одяг без зайвого шуму",
    aboutText:
      "Ми створюємо базові речі для міського ритму: чисті силуети, спокійні кольори, якісні тканини та комфортну посадку. Це одяг, який легко поєднувати між собою щодня і швидко адаптувати під стиль конкретного бренду.",
    productNote: "* У демо-шаблоні замініть посилання Telegram/Viber на контакти реального магазину.",
    contactIntro:
      "Для демо-шаблону тут вказані тестові контакти. Перед продажем або передачею клієнту замініть їх на реальні контакти магазину.",
    formIntro:
      "Форма в демо-версії показує успішне повідомлення на сторінці. Її можна підключити до Formspree, Telegram-бота, CRM або іншого сервісу.",
    formSuccessMessage: "Дякуємо! Заявку прийнято в демо-режимі.",
    telegramUrl: "https://t.me/yourusername",
    viberUrl: "viber://chat?number=%2B380000000000",
    phone: "+38 000 000 00 00",
    email: "urbanwear@example.com",
    instagram: "@urbanwear.shop",
    schedule: "Пн-Сб, 10:00-19:00",
    deliveryIntro:
      "Прості умови замовлення для клієнтів: швидка відправка, зручна оплата та можливість обміну розміру після отримання.",
    deliveryBody:
      "Замовлення відправляються Новою поштою по всій Україні протягом 1-2 робочих днів після підтвердження менеджером.",
    paymentBody:
      "Покупець може обрати зручний спосіб оплати під час підтвердження замовлення в Telegram або Viber.",
    exchangeBody:
      "Якщо розмір не підійшов, клієнт може оформити обмін згідно з умовами магазину та правилами перевізника.",
    ctaText: "Напишіть нам - допоможемо з розміром, наявністю та оформленням замовлення.",
  },

  products: {
    "hoodie-black": {
      title: "Чорне oversize худі",
      category: "hoodies",
      categoryTitle: "Худі",
      imageLabel: "Худі",
      price: "1 899 грн",
      shortDescription: "Чорне oversize худі з щільного футеру",
      isPopular: true,
      visual: "linear-gradient(135deg, #171717, #4d4d4d)",
      description:
        "Чорне oversize худі з м'якої тканини для щоденного міського стилю. Зручна посадка, щільний капюшон, базовий силует і мінімалістичний вигляд.",
      specs: [
        "Матеріал: бавовна / поліестер",
        "Крій: oversize",
        "Колір: чорний",
        "Сезон: осінь / зима / весна",
        "Догляд: делікатне прання до 30°C",
      ],
    },

    "tshirt-white": {
      title: "Біла базова футболка",
      category: "t-shirts",
      categoryTitle: "Футболки",
      imageLabel: "Футболка",
      price: "799 грн",
      shortDescription: "Базова біла футболка прямого крою",
      isPopular: true,
      visual: "linear-gradient(135deg, #f7f7f2, #c9c9c1)",
      description:
        "Базова біла футболка прямого крою. Легка, зручна і підходить для щоденного образу, багатошарових луків або мінімалістичного гардероба.",
      specs: [
        "Матеріал: 100% бавовна",
        "Крій: regular fit",
        "Колір: білий",
        "Сезон: весна / літо",
        "Догляд: прання до 30°C",
      ],
    },

    "cargo-pants": {
      title: "Графітові карго-штани",
      category: "pants",
      categoryTitle: "Штани",
      imageLabel: "Штани",
      price: "1 599 грн",
      shortDescription: "Графітові карго-штани relaxed fit",
      isPopular: true,
      visual: "linear-gradient(135deg, #2e3438, #848b8f)",
      description:
        "Графітові карго-штани з функціональними кишенями. Підходять для міського стилю, подорожей і активного щоденного носіння.",
      specs: [
        "Матеріал: щільна бавовна",
        "Крій: relaxed fit",
        "Колір: графітовий",
        "Кишені: бокові cargo",
        "Сезон: демісезон",
      ],
    },

    "cap-black": {
      title: "Чорна класична кепка",
      category: "accessories",
      categoryTitle: "Аксесуари",
      imageLabel: "Кепка",
      price: "599 грн",
      shortDescription: "Чорна базова кепка з регулюванням",
      isPopular: false,
      visual: "linear-gradient(135deg, #111111, #6a6a6a)",
      description:
        "Чорна базова кепка з мінімалістичним дизайном. Добре поєднується з худі, футболками та спортивними образами.",
      specs: [
        "Матеріал: бавовна",
        "Колір: чорний",
        "Розмір: універсальний",
        "Регулювання: ремінець ззаду",
        "Сезон: всесезонна",
      ],
    },

    "crossbody-bag": {
      title: "Сумка через плече",
      category: "accessories",
      categoryTitle: "Аксесуари",
      imageLabel: "Сумка",
      price: "999 грн",
      shortDescription: "Міська сумка через плече",
      isPopular: false,
      visual: "linear-gradient(135deg, #202020, #9a8f7a)",
      description:
        "Міська сумка через плече для телефону, документів, ключів та дрібних речей. Компактна форма і регульований ремінь.",
      specs: [
        "Матеріал: текстиль",
        "Колір: чорний",
        "Тип: crossbody",
        "Кількість відділень: 2",
        "Призначення: щоденне використання",
      ],
    },

    "longsleeve-grey": {
      title: "Сірий базовий лонгслів",
      category: "t-shirts",
      categoryTitle: "Футболки",
      imageLabel: "Лонгслів",
      price: "1 099 грн",
      shortDescription: "Сірий базовий лонгслів",
      isPopular: false,
      visual: "linear-gradient(135deg, #c8c8c2, #777773)",
      description:
        "Сірий базовий лонгслів для спокійних повсякденних образів. Добре підходить під куртку, жилет або худі.",
      specs: [
        "Матеріал: бавовна / еластан",
        "Крій: regular fit",
        "Колір: сірий",
        "Рукав: довгий",
        "Сезон: осінь / весна",
      ],
    },
  },
};

function cloneStoreData(data) {
  return JSON.parse(JSON.stringify(data));
}

function mergeSettings(defaultSettings, savedSettings) {
  return {
    ...defaultSettings,
    ...(savedSettings || {}),
  };
}

function normalizeStoreData(data) {
  const savedProducts =
    data && data.products && typeof data.products === "object" ? data.products : null;

  return {
    settings: mergeSettings(defaultStoreData.settings, data ? data.settings : null),
    products: savedProducts || cloneStoreData(defaultStoreData.products),
  };
}

function getSavedStoreData() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const savedData = localStorage.getItem(URBANWEAR_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.warn("UrbanWear saved data could not be loaded.", error);
    return null;
  }
}

function getStoreData() {
  return normalizeStoreData(getSavedStoreData());
}

function saveStoreData(data) {
  const normalizedData = normalizeStoreData(data);

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(URBANWEAR_STORAGE_KEY, JSON.stringify(normalizedData));
  }

  return normalizedData;
}

function resetStoreData() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(URBANWEAR_STORAGE_KEY);
  }

  return cloneStoreData(defaultStoreData);
}

const storeData = getStoreData();
const products = storeData.products;
