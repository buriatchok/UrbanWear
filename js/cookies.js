(function () {
  "use strict";

  const STORAGE_KEY = "urbanwear:cookie-consent";
  const CONSENT_VERSION = 1;
  const EVENT_NAME = "urbanwear:cookie-consent";
  let currentConsent = readConsent();
  let lastFocusedElement = null;

  function isValidConsent(value) {
    return Boolean(
      value &&
      value.version === CONSENT_VERSION &&
      value.necessary === true &&
      typeof value.analytics === "boolean" &&
      typeof value.updatedAt === "string"
    );
  }

  function readConsent() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      return isValidConsent(saved) ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function writeConsent(analytics, source) {
    currentConsent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(analytics),
      updatedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConsent));
    } catch (error) {
      // The choice still applies for this page view if storage is unavailable.
    }

    dispatchConsent(source);
    return currentConsent;
  }

  function dispatchConsent(source) {
    if (!currentConsent) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: {
          version: currentConsent.version,
          necessary: true,
          analytics: currentConsent.analytics,
          updatedAt: currentConsent.updatedAt,
          source: source
        }
      })
    );
  }

  function buildInterface() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <section class="cookie-consent" data-cookie-banner hidden aria-labelledby="cookie-banner-title">
        <div class="cookie-consent__inner">
          <div>
            <h2 id="cookie-banner-title">Ваш вибір cookie-файлів</h2>
            <p>
              Необхідні технології забезпечують роботу сайту. Аналітичні допомагають покращувати UrbanWear
              і використовуються лише за вашою згодою. Докладніше у
              <a href="privacy.html#cookies">політиці конфіденційності</a>.
            </p>
          </div>
          <div class="cookie-consent__actions">
            <button class="cookie-button" type="button" data-cookie-action="necessary">Лише необхідні</button>
            <button class="cookie-button" type="button" data-cookie-action="settings">Налаштувати</button>
            <button class="cookie-button cookie-button--primary" type="button" data-cookie-action="all">
              Прийняти всі
            </button>
          </div>
        </div>
      </section>

      <div class="cookie-modal" data-cookie-modal hidden>
        <section
          class="cookie-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          aria-describedby="cookie-settings-description"
        >
          <div class="cookie-modal__header">
            <div>
              <h2 id="cookie-settings-title">Налаштування cookie-файлів</h2>
              <p id="cookie-settings-description">
                Оберіть, які категорії UrbanWear може використовувати на цьому пристрої.
              </p>
            </div>
            <button class="cookie-modal__close" type="button" data-cookie-action="close" aria-label="Закрити">
              &times;
            </button>
          </div>

          <div class="cookie-category">
            <div>
              <h3>Необхідні</h3>
              <p>Потрібні для базових функцій, безпеки та збереження вашого вибору cookie-файлів.</p>
            </div>
            <span class="cookie-category__status">Завжди активні</span>
          </div>

          <div class="cookie-category">
            <div>
              <h3>Аналітичні</h3>
              <p>Допомагають зрозуміти використання сайту та покращувати його роботу.</p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" data-cookie-analytics aria-label="Дозволити аналітичні cookie-файли" />
              <span aria-hidden="true"></span>
            </label>
          </div>

          <p>
            Ви можете змінити вибір у будь-який момент кнопкою «Cookie-файли».
            <a href="privacy.html#cookies">Докладніше про конфіденційність</a>.
          </p>

          <div class="cookie-modal__actions">
            <button class="cookie-button" type="button" data-cookie-action="necessary">Лише необхідні</button>
            <button class="cookie-button cookie-button--primary" type="button" data-cookie-action="save">
              Зберегти вибір
            </button>
          </div>
        </section>
      </div>
    `;

    while (wrapper.firstElementChild) {
      document.body.append(wrapper.firstElementChild);
    }
  }

  function getBanner() {
    return document.querySelector("[data-cookie-banner]");
  }

  function getModal() {
    return document.querySelector("[data-cookie-modal]");
  }

  function openSettings(trigger) {
    const modal = getModal();
    const analyticsInput = modal.querySelector("[data-cookie-analytics]");

    lastFocusedElement = trigger || document.activeElement;
    analyticsInput.checked = Boolean(currentConsent && currentConsent.analytics);
    modal.hidden = false;
    document.body.classList.add("cookie-modal-open");
    modal.querySelector("[data-cookie-action='close']").focus();
  }

  function closeSettings() {
    const modal = getModal();

    modal.hidden = true;
    document.body.classList.remove("cookie-modal-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function finishChoice(analytics, source) {
    writeConsent(analytics, source);
    getBanner().hidden = true;
    closeSettings();
  }

  function handleClick(event) {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const settingsTrigger = target ? target.closest("[data-cookie-settings]") : null;
    const actionButton = target ? target.closest("[data-cookie-action]") : null;

    if (settingsTrigger) {
      event.preventDefault();
      openSettings(settingsTrigger);
      return;
    }

    if (!actionButton) {
      if (event.target === getModal()) {
        closeSettings();
      }
      return;
    }

    const action = actionButton.dataset.cookieAction;

    if (action === "settings") {
      openSettings(actionButton);
    } else if (action === "close") {
      closeSettings();
    } else if (action === "necessary") {
      finishChoice(false, "necessary");
    } else if (action === "all") {
      finishChoice(true, "accept-all");
    } else if (action === "save") {
      const analytics = getModal().querySelector("[data-cookie-analytics]").checked;
      finishChoice(analytics, "settings");
    }
  }

  function handleKeydown(event) {
    const modal = getModal();

    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeSettings();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      modal.querySelectorAll("button:not([disabled]), input:not([disabled]), a[href]")
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function init() {
    buildInterface();
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);

    if (currentConsent) {
      dispatchConsent("stored");
    } else {
      getBanner().hidden = false;
    }

    window.UrbanWearCookies = Object.freeze({
      getConsent: function () {
        return currentConsent ? { ...currentConsent } : null;
      },
      openSettings: function () {
        openSettings(document.activeElement);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
