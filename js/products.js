const URBANWEAR_STORAGE_KEY = "urbanwear-store-data-commercial-v1";

const defaultStoreData = {
  settings: {
    brandName: "UrbanWear",
    footerText: "Сучасний streetwear та базовий одяг для щоденного міського стилю.",
    heroKicker: "Нова колекція UrbanWear",
    heroTitle: "Стильний одяг для ритму міста",
    heroText:
      "Базові речі, streetwear-фасони та мінімалістичні образи, які легко носити щодня.",
    heroVisualText: "UrbanWear / міська колекція",
    aboutTitle: "UrbanWear — одяг без зайвого шуму",
    aboutText:
      "Ми створили UrbanWear для тих, хто хоче виглядати стильно без складних рішень. Наші речі легко поєднуються, не перевантажують образ і залишаються зручними протягом усього дня.",
    productNote: "Потрібна допомога з розміром? Напишіть нам у Telegram або Viber — допоможемо обрати.",
    contactIntro:
      "Маєте питання щодо розміру, замовлення або доставки? Напишіть нам — команда UrbanWear допоможе.",
    formIntro:
      "Залиште повідомлення, і ми відповімо найближчим часом.",
    formSuccessMessage: "Повідомлення надіслано. Дякуємо за звернення — ми відповімо найближчим часом.",
    telegramUrl: "https://t.me/urbanwear_support",
    viberUrl: "viber://chat?number=%2B380971234567",
    phone: "+380 97 123 45 67",
    email: "support@urbanwear.ua",
    instagram: "@urbanwear.ua",
    schedule: "Пн–Сб: 10:00–19:00, Нд: вихідний",
    deliveryIntro:
      "Доставляємо замовлення по всій Україні, пропонуємо зручні способи оплати та обмін протягом 14 днів.",
    deliveryBody:
      "Відправляємо Новою поштою у відділення, поштомат або кур'єром протягом 1–2 робочих днів після підтвердження замовлення.",
    paymentBody:
      "Оплачуйте карткою онлайн або при отриманні у відділенні Нової пошти. Усі платежі захищені.",
    exchangeBody:
      "Якщо розмір не підійшов, оформіть обмін або повернення протягом 14 днів після отримання. Товар має зберігати товарний вигляд, бірки та пакування.",
    ctaText: "Напишіть нам — допоможемо з розміром, наявністю та оформленням замовлення.",
  },

  categories: {
    hoodies: {
      title: "Худі",
      description: "Об’ємні, зручні та теплі моделі для щоденного streetwear-образу.",
    },
    "t-shirts": {
      title: "Футболки",
      description: "Базові футболки спокійних кольорів для будь-якого сезону.",
    },
    pants: {
      title: "Штани",
      description: "Практичні карго та прямі силуети для міського ритму.",
    },
    accessories: {
      title: "Аксесуари",
      description: "Кепки, сумки та деталі, які завершують образ.",
    },
  },

  products: {
    "hoodie-black": {
      title: "Чорне oversize худі",
      category: "hoodies",
      categoryTitle: "Худі",
      imageLabel: "Худі",
      price: "1 899 грн",
      shortDescription: "Щільне oversize-худі для прохолодних міських днів",
      isPopular: true,
      visual: "linear-gradient(135deg, #171717, #4d4d4d)",
      description:
        "Чорне oversize-худі UrbanWear із м'якого триниткового футеру. Вільна посадка, місткий капюшон і лаконічний дизайн роблять його універсальною основою щоденного образу.",
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
      shortDescription: "Щільна біла футболка з чистим прямим силуетом",
      isPopular: true,
      visual: "linear-gradient(135deg, #f7f7f2, #c9c9c1)",
      description:
        "Біла футболка UrbanWear зі щільної бавовни тримає форму та комфортно сидить протягом дня. Носіть окремо або як базовий шар під сорочку чи куртку.",
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
      shortDescription: "Практичні карго relaxed fit із функціональними кишенями",
      isPopular: true,
      visual: "linear-gradient(135deg, #2e3438, #848b8f)",
      description:
        "Графітові карго-штани UrbanWear поєднують вільний крій і зручні бокові кишені. Модель створена для активного міського ритму, подорожей і щоденних образів.",
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
      shortDescription: "Лаконічна кепка з регульованою посадкою",
      isPopular: false,
      visual: "linear-gradient(135deg, #111111, #6a6a6a)",
      description:
        "Чорна кепка UrbanWear з вигнутим козирком і регульованою застібкою. Завершує базові та streetwear-образи без зайвих деталей.",
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
      shortDescription: "Компактна crossbody-сумка для речей першої потреби",
      isPopular: false,
      visual: "linear-gradient(135deg, #202020, #9a8f7a)",
      description:
        "Компактна crossbody-сумка UrbanWear вміщує телефон, документи, ключі та інші необхідні речі. Регульований ремінь забезпечує зручну посадку.",
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
      shortDescription: "М'який сірий лонгслів для багатошарових образів",
      isPopular: false,
      visual: "linear-gradient(135deg, #c8c8c2, #777773)",
      description:
        "Сірий лонгслів UrbanWear із м'якої бавовни — універсальна база для прохолодної погоди. Комфортно носиться самостійно та під верхнім одягом.",
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
  const savedCategories =
    data && data.categories && typeof data.categories === "object" ? data.categories : null;

  return {
    settings: mergeSettings(defaultStoreData.settings, data ? data.settings : null),
    categories: savedCategories || cloneStoreData(defaultStoreData.categories),
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
