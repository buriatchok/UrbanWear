(function () {
  const disabledMessengerHref = "#demo-messenger-disabled";

  function ensureDemoStyles() {
    if (document.getElementById("urbanwearDemoStyles")) return;
    const style = document.createElement("style");
    style.id = "urbanwearDemoStyles";
    style.textContent = `
      .urbanwear-demo-strip {
        width: 100%;
        min-height: 52px;
        display: grid;
        place-items: center;
        padding: 14px 18px;
        border-top: 1px solid rgba(231, 210, 185, .28);
        background: #111111;
        color: #ffffff;
        font: 800 15px/1.35 Arial, sans-serif;
        text-align: center;
      }
      .urbanwear-demo-strip strong {
        color: #e7d2b9;
      }
      .urbanwear-demo-toast {
        position: fixed;
        left: 50%;
        bottom: 22px;
        z-index: 1000;
        transform: translateX(-50%) translateY(16px);
        max-width: min(420px, calc(100% - 28px));
        padding: 12px 16px;
        border: 1px solid rgba(231, 210, 185, .45);
        border-radius: 999px;
        background: #111111;
        color: #ffffff;
        box-shadow: 0 16px 45px rgba(17, 17, 17, .24);
        font: 800 13px/1.35 Arial, sans-serif;
        opacity: 0;
        pointer-events: none;
        transition: opacity .18s ease, transform .18s ease;
      }
      .urbanwear-demo-toast.is-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      a[data-demo-disabled],
      button[data-demo-disabled] {
        cursor: not-allowed;
      }
    `;
    document.head.append(style);
  }

  function showDemoToast(message) {
    let toast = document.querySelector(".urbanwear-demo-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "urbanwear-demo-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showDemoToast.timeout);
    showDemoToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function disableMessengerLinks() {
    document.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isMessenger =
        href === disabledMessengerHref ||
        /^viber:/i.test(href) ||
        /^tg:/i.test(href) ||
        /^https?:\/\/(t\.me|telegram\.me|wa\.me|m\.me)\//i.test(href) ||
        ["telegramUrl", "viberUrl"].includes(link.dataset.storeHref);

      if (!isMessenger) return;
      link.dataset.demoDisabled = "messenger";
      link.setAttribute("href", disabledMessengerHref);
      link.setAttribute("aria-disabled", "true");
      link.removeAttribute("target");
      link.removeAttribute("rel");
    });
  }

  function appendDemoStrip() {
    if (document.querySelector(".urbanwear-demo-strip")) return;
    const strip = document.createElement("div");
    strip.className = "urbanwear-demo-strip";
    strip.innerHTML = "Розроблено як демо версія - <strong>BuriatchokWEB.</strong>";
    document.body.append(strip);
  }

  document.addEventListener("click", (event) => {
    const disabled = event.target.closest("[data-demo-disabled]");
    if (!disabled) return;
    event.preventDefault();
    showDemoToast("Демо-версія: перехід у месенджери вимкнено.");
  });

  document.addEventListener("DOMContentLoaded", () => {
    ensureDemoStyles();
    disableMessengerLinks();
    appendDemoStrip();
    setTimeout(disableMessengerLinks, 0);
  });

  window.addEventListener("urbanwear:store-ready", () => setTimeout(disableMessengerLinks, 0));
})();
