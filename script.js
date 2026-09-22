/* =========================================================
   FollowCenter.ir
   Complete replacement for script.js
========================================================= */

const API_BASE = "https://followcenter-api.onrender.com";

/* =========================================================
   SERVICE CATALOG
========================================================= */

const SERVICES = {
  instagram: {
    name: "Instagram",
    faName: "اینستاگرام",
    icon: "📸",
    items: [
      { id: "ig_follow", name: "خرید فالوور اینستاگرام", price: 150000 },
      { id: "ig_like", name: "خرید لایک اینستاگرام", price: 30000 },
      { id: "ig_view", name: "خرید ویو اینستاگرام", price: 20000 },
      { id: "ig_story_view", name: "خرید ویو استوری اینستاگرام", price: 25000 },
      { id: "ig_comment", name: "خرید کامنت اینستاگرام", price: 80000 },
      { id: "ig_save", name: "خرید سیو اینستاگرام", price: 45000 },
      { id: "ig_share", name: "خرید اشتراک‌گذاری اینستاگرام", price: 45000 },
      { id: "ig_story_like", name: "خرید لایک استوری اینستاگرام", price: 35000 },
      { id: "ig_live", name: "خرید ویو لایو اینستاگرام", price: 60000 },
      { id: "ig_explore", name: "افزایش بازدید اکسپلور", price: 70000 },
      { id: "ig_impression", name: "افزایش ایمپرشن اینستاگرام", price: 30000 },
      { id: "ig_poll", name: "تعامل نظرسنجی اینستاگرام", price: 50000 },
      { id: "ig_video_view", name: "خرید ویو ویدیو اینستاگرام", price: 22000 },
      { id: "ig_repost", name: "خرید ری‌پست اینستاگرام", price: 50000 },
      { id: "ig_comment_like", name: "لایک کامنت اینستاگرام", price: 40000 },
      { id: "ig_channel_member", name: "عضو کانال اینستاگرام", price: 160000 }
    ]
  },

  telegram: {
    name: "Telegram",
    faName: "تلگرام",
    icon: "✈️",
    items: [
      { id: "tg_channel", name: "افزایش ممبر کانال تلگرام", price: 180000 },
      { id: "tg_group", name: "افزایش ممبر گروه تلگرام", price: 180000 },
      { id: "tg_view", name: "خرید ویو تلگرام", price: 25000 },
      { id: "tg_story", name: "خرید ویو استوری تلگرام", price: 30000 },
      { id: "tg_reaction", name: "خرید ری‌اکشن تلگرام", price: 35000 },
      { id: "tg_like", name: "خرید لایک تلگرام", price: 35000 },
      { id: "tg_share", name: "خرید اشتراک‌گذاری تلگرام", price: 30000 },
      { id: "tg_ads", name: "تبلیغات تلگرام", price: 220000 },
      { id: "tg_poll", name: "رأی نظرسنجی تلگرام", price: 40000 },
      { id: "tg_premium", name: "خدمات تلگرام پریمیوم", price: 260000 },
      { id: "tg_story_like", name: "لایک استوری تلگرام", price: 30000 },
      { id: "tg_boost", name: "بوست تلگرام", price: 200000 },
      { id: "tg_star", name: "استار تلگرام", price: 400000 },
      { id: "tg_gift", name: "گیفت تلگرام", price: 300000 },
      { id: "tg_reaction_positive", name: "ری‌اکشن مثبت تلگرام", price: 20000 },
      { id: "tg_reaction_negative", name: "ری‌اکشن منفی تلگرام", price: 20000 }
    ]
  },

  rubika: {
    name: "Rubika",
    faName: "روبیکا",
    icon: "🟣",
    items: [
      { id: "rb_follow", name: "خرید دنبال‌کننده روبیکا", price: 140000 },
      { id: "rb_like", name: "خرید لایک روبیکا", price: 30000 },
      { id: "rb_view", name: "خرید ویو روبیکا", price: 20000 },
      { id: "rb_comment", name: "خرید کامنت روبیکا", price: 50000 },
      { id: "rb_share", name: "خرید اشتراک‌گذاری روبیکا", price: 35000 }
    ]
  },

  eitaa: {
    name: "Eitaa",
    faName: "ایتا",
    icon: "🔵",
    items: [
      { id: "ea_channel", name: "افزایش ممبر کانال ایتا", price: 150000 },
      { id: "ea_group", name: "افزایش ممبر گروه ایتا", price: 150000 },
      { id: "ea_view", name: "خرید ویو ایتا", price: 20000 },
      { id: "ea_ads", name: "تبلیغات ایتا", price: 250000 },
      { id: "ea_directory", name: "افزایش بازدید دایرکتوری ایتا", price: 80000 },
      { id: "ea_like", name: "خرید لایک ایتا", price: 30000 },
      { id: "ea_comment", name: "خرید کامنت ایتا", price: 50000 }
    ]
  }
};

/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("fa-IR") + " تومان";
}

function formatNumber(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("fa-IR");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getQueryParam(name) {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get(name);
}

/* =========================================================
   API
========================================================= */

async function apiFetch(url, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        `خطای سرور (${response.status})`
      );
    }

    return data;

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "زمان پاسخ سرور تمام شد. دوباره تلاش کنید."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   API SERVICES
========================================================= */

let API_SERVICES = [];

async function loadApiServices() {
  try {
    const data = await apiFetch(
      `${API_BASE}/api/services`
    );

    if (
      data &&
      data.success === true &&
      Array.isArray(data.services)
    ) {
      API_SERVICES =
        data.services.filter(
          service =>
            service.is_active !== false
        );

      return API_SERVICES;
    }

    return [];

  } catch (error) {
    console.warn(
      "Could not load API services:",
      error
    );

    return [];
  }
}

function getApiService(serviceCode) {
  if (!serviceCode) {
    return null;
  }

  const code =
    normalizeText(serviceCode);

  return (
    API_SERVICES.find(service => {
      return (
        normalizeText(
          service.service_code
        ) === code ||
        normalizeText(
          service.code
        ) === code ||
        normalizeText(
          service.slug
        ) === code
      );
    }) || null
  );
}

function getStaticService(serviceCode) {
  for (
    const [networkKey, network]
    of Object.entries(SERVICES)
  ) {
    const found =
      network.items.find(
        service =>
          normalizeText(service.id) ===
          normalizeText(serviceCode)
      );

    if (found) {
      return {
        ...found,
        network: networkKey,
        networkName: network.faName
      };
    }
  }

  return null;
}

/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
  const button =
    document.querySelector(
      ".mobile-toggle"
    );

  const nav =
    document.querySelector(
      ".menu"
    );

  if (!button || !nav) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      nav.classList.toggle(
        "active"
      );

      button.classList.toggle(
        "active"
      );
    }
  );
}

/* =========================================================
   NETWORK SELECT
========================================================= */

function populateNetworkSelect(
  select
) {
  if (!select) {
    return;
  }

  select.innerHTML =
    '<option value="">انتخاب شبکه</option>';

  Object.entries(
    SERVICES
  ).forEach(
    ([key, network]) => {
      const option =
        document.createElement(
          "option"
        );

      option.value = key;

      option.textContent =
        `${network.icon} ${network.faName}`;

      select.appendChild(
        option
      );
    }
  );
}

/* =========================================================
   SERVICE SELECT
========================================================= */

function populateServiceSelect(
  select,
  networkKey
) {
  if (!select) {
    return;
  }

  select.innerHTML =
    '<option value="">انتخاب سرویس</option>';

  if (
    !networkKey ||
    !SERVICES[networkKey]
  ) {
    return;
  }

  SERVICES[
    networkKey
  ].items.forEach(
    service => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        service.id;

      option.textContent =
        service.name;

      option.dataset.price =
        String(service.price);

      select.appendChild(
        option
      );
    }
  );
}

/* =========================================================
   ORDER PRICE
========================================================= */

function updateOrderPrice() {
  const serviceSelect =
    document.querySelector(
      "#service"
    );

  const quantityInput =
    document.querySelector(
      "#quantity"
    );

  const totalElement =
    document.querySelector(
      "#total"
    );

  if (
    !serviceSelect ||
    !quantityInput ||
    !totalElement
  ) {
    return;
  }

  const serviceCode =
    serviceSelect.value;

  const quantity =
    Number(
      quantityInput.value
    ) || 0;

  if (
    !serviceCode ||
    quantity <= 0
  ) {
    totalElement.textContent =
      "۰ تومان";

    return;
  }

  const apiService =
    getApiService(
      serviceCode
    );

  const staticService =
    getStaticService(
      serviceCode
    );

  const pricePer1000 =
    Number(
      apiService?.price_per_1000 ??
      apiService?.price ??
      staticService?.price ??
      0
    );

  const total =
    Math.ceil(
      (pricePer1000 *
        quantity) /
      1000
    );

  totalElement.textContent =
    formatPrice(total);
}

/* =========================================================
   ORDER PAGE
========================================================= */

function setupOrder() {
  const form =
    document.querySelector(
      "#orderForm"
    );

  if (!form) {
    return;
  }

  const networkSelect =
    document.querySelector(
      "#network"
    );

  const serviceSelect =
    document.querySelector(
      "#service"
    );

  const quantityInput =
    document.querySelector(
      "#quantity"
    );

  const linkInput =
    document.querySelector(
      "#link"
    );

  const phoneInput =
    document.querySelector(
      "#phone"
    );

  const notesInput =
    document.querySelector(
      "#notes"
    );

  const totalElement =
    document.querySelector(
      "#total"
    );

  const messageElement =
    document.querySelector(
      "#success, #orderMessage, .order-message"
    );

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  /* =====================================================
     SUBMIT LISTENER
  ===================================================== */

  form.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (
        !serviceSelect ||
        !quantityInput ||
        !linkInput ||
        !phoneInput
      ) {
        return;
      }

      if (submitButton) {
        submitButton.disabled =
          true;

        submitButton.dataset.oldText =
          submitButton.textContent;

        submitButton.textContent =
          "در حال ثبت سفارش...";
      }

      if (messageElement) {
        messageElement.innerHTML =
          "";

        messageElement.className =
          "";
      }

      try {
        const serviceCode =
          serviceSelect.value
            .trim();

        const quantity =
          Number(
            quantityInput.value
          );

        const link =
          linkInput.value.trim();

        const phone =
          phoneInput.value.trim();

        const notes =
          notesInput?.value.trim() ||
          "";

        /* ================================================
           VALIDATION
        ================================================ */

        if (!serviceCode) {
          throw new Error(
            "لطفاً سرویس را انتخاب کنید."
          );
        }

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            "لطفاً تعداد صحیح وارد کنید."
          );
        }

        if (!link) {
          throw new Error(
            "لطفاً لینک موردنظر را وارد کنید."
          );
        }

        if (!phone) {
          throw new Error(
            "لطفاً شماره موبایل را وارد کنید."
          );
        }

        /* ================================================
           CHECK STATIC SERVICE
           ثبت سفارش دیگر وابسته به API SERVICES نیست.
        ================================================ */

        const staticService =
          getStaticService(
            serviceCode
          );

        if (!staticService) {
          throw new Error(
            "سرویس انتخاب‌شده معتبر نیست."
          );
        }

        /* ================================================
           SEND ORDER
           بک‌اند جدید مستقیماً serviceCode را قبول می‌کند.
        ================================================ */

        const result =
          await apiFetch(
            `${API_BASE}/api/orders`,
            {
              method: "POST",

              body: JSON.stringify({
                serviceCode:
                  serviceCode,

                quantity:
                  quantity,

                link:
                  link,

                phone:
                  phone,

                notes:
                  notes
              })
            }
          );

        if (
          !result ||
          result.success !== true
        ) {
          throw new Error(
            result?.message ||
            "ثبت سفارش انجام نشد."
          );
        }

        /* ================================================
           ORDER CODE
        ================================================ */

        const order =
          result.order ||
          {};

        const orderCode =
          result.orderCode ||
          result.code ||
          order.order_code ||
          order.orderCode ||
          order.code ||
          "";

        /* ================================================
           SUCCESS
        ================================================ */

        if (messageElement) {
          messageElement.className =
            "order-message success";

          messageElement.innerHTML = `
            <div>
              <strong>
                ✅ سفارش با موفقیت ثبت شد
              </strong>
            </div>

            ${
              orderCode
                ? `
                  <div style="margin-top:10px">
                    کد پیگیری:
                    <strong>
                      ${escapeHTML(
                        orderCode
                      )}
                    </strong>
                  </div>
                `
                : ""
            }
          `;
        }

        /* ================================================
           SAVE LAST ORDER
        ================================================ */

        if (orderCode) {
          try {
            localStorage.setItem(
              "followcenter_last_order",
              orderCode
            );
          } catch {}
        }

        /* ================================================
           RESET
        ================================================ */

        form.reset();

        if (networkSelect) {
          networkSelect.value =
            "";
        }

        if (serviceSelect) {
          serviceSelect.innerHTML =
            '<option value="">ابتدا شبکه را انتخاب کنید</option>';
        }

        if (quantityInput) {
          quantityInput.value =
            "1000";
        }

        if (totalElement) {
          totalElement.textContent =
            "۰ تومان";
        }

        /* ================================================
           TRACKING
        ================================================ */

        if (orderCode) {
          setTimeout(
            () => {
              window.location.href =
                `tracking.html?code=${encodeURIComponent(
                  orderCode
                )}`;
            },
            1500
          );
        }

      } catch (error) {
        console.error(
          "Order error:",
          error
        );

        if (messageElement) {
          messageElement.className =
            "order-message error";

          messageElement.innerHTML = `
            <strong>
              ❌ ${escapeHTML(
                error.message ||
                "ثبت سفارش انجام نشد."
              )}
            </strong>
          `;
        }

      } finally {
        if (submitButton) {
          submitButton.disabled =
            false;

          submitButton.textContent =
            submitButton.dataset.oldText ||
            "ثبت سفارش Demo";
        }
      }
    }
  );

  /* =====================================================
     NETWORK CHANGE
  ===================================================== */

  if (networkSelect) {
    populateNetworkSelect(
      networkSelect
    );

    networkSelect.addEventListener(
      "change",
      () => {
        populateServiceSelect(
          serviceSelect,
          networkSelect.value
        );

        updateOrderPrice();
      }
    );
  }

  /* =====================================================
     SERVICE CHANGE
  ===================================================== */

  if (serviceSelect) {
    serviceSelect.addEventListener(
      "change",
      updateOrderPrice
    );
  }

  /* =====================================================
     QUANTITY CHANGE
  ===================================================== */

  if (quantityInput) {
    quantityInput.addEventListener(
      "input",
      updateOrderPrice
    );
  }

  /* =====================================================
     QUERY SERVICE
  ===================================================== */

  const requestedService =
    getQueryParam(
      "service"
    );

  if (
    requestedService &&
    networkSelect &&
    serviceSelect
  ) {
    const staticService =
      getStaticService(
        requestedService
      );

    if (staticService) {
      networkSelect.value =
        staticService.network;

      populateServiceSelect(
        serviceSelect,
        staticService.network
      );

      serviceSelect.value =
        staticService.id;

      updateOrderPrice();
    }
  }

  /* =====================================================
     LOAD API SERVICES
     فقط برای قیمت/نمایش اطلاعات؛
     ثبت سفارش به آن وابسته نیست.
  ===================================================== */

  loadApiServices()
    .then(() => {
      updateOrderPrice();
    })
    .catch(error => {
      console.warn(
        "Service loading error:",
        error
      );
    });
}

/* =========================================================
   TRACKING
========================================================= */

function setupTracking() {
  const form =
    document.querySelector(
      "#trackingForm"
    );

  const input =
    document.querySelector(
      "#code"
    );

  const resultElement =
    document.querySelector(
      "#trackingResult"
    );

  if (
    !form ||
    !input ||
    !resultElement
  ) {
    return;
  }

  form.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const code =
        input.value
          .trim()
          .toUpperCase();

      if (
        !/^FC-\d{6}$/.test(
          code
        )
      ) {
        resultElement.innerHTML = `
          <div class="tracking-error">
            ❌ کد پیگیری باید مانند FC-123456 باشد.
          </div>
        `;

        return;
      }

      resultElement.innerHTML = `
        <p>
          ⏳ در حال دریافت اطلاعات سفارش...
        </p>
      `;

      try {
        const data =
          await apiFetch(
            `${API_BASE}/api/orders/${encodeURIComponent(
              code
            )}`
          );

        if (
          !data ||
          data.success !== true ||
          !data.order
        ) {
          throw new Error(
            data?.message ||
            "سفارش پیدا نشد."
          );
        }

        renderTrackingResult(
          data.order,
          code,
          resultElement
        );

      } catch (error) {
        console.error(
          "Tracking error:",
          error
        );

        resultElement.innerHTML = `
          <div class="tracking-error">
            ❌ ${escapeHTML(
              error.message ||
              "خطا در دریافت سفارش."
            )}
          </div>
        `;
      }
    }
  );

  const urlCode =
    getQueryParam(
      "code"
    ) ||
    getQueryParam(
      "order"
    );

  if (urlCode) {
    input.value =
      urlCode
        .trim()
        .toUpperCase();

    setTimeout(
      () => {
        form.dispatchEvent(
          new Event(
            "submit",
            {
              bubbles: true,
              cancelable: true
            }
          )
        );
      },
      300
    );
  }
}

function renderTrackingResult(
  order,
  fallbackCode,
  resultElement
) {
  const code =
    order.code ||
    order.order_code ||
    fallbackCode;

  const network =
    order.network_name ||
    order.network ||
    "-";

  const service =
    order.service_name ||
    order.service ||
    "-";

  const quantity =
    Number(
      order.quantity
    ) || 0;

  const amount =
    Number(
      order.amount ??
      order.total_price ??
      0
    );

  const status =
    order.status ||
    "pending";

  const createdAt =
    order.created_at ||
    order.createdAt ||
    "";

  resultElement.innerHTML = `
    <div class="tracking-card">

      <div class="tracking-header">
        <h3>
          📦 اطلاعات سفارش
        </h3>

        <div class="tracking-code">
          ${escapeHTML(code)}
        </div>
      </div>

      <div class="tracking-row">
        <span>وضعیت</span>
        <strong>
          ${statusBadge(status)}
        </strong>
      </div>

      <div class="tracking-row">
        <span>شبکه</span>
        <strong>
          ${escapeHTML(network)}
        </strong>
      </div>

      <div class="tracking-row">
        <span>سرویس</span>
        <strong>
          ${escapeHTML(service)}
        </strong>
      </div>

      <div class="tracking-row">
        <span>تعداد</span>
        <strong>
          ${formatNumber(quantity)}
        </strong>
      </div>

      <div class="tracking-row">
        <span>مبلغ</span>
        <strong>
          ${formatPrice(amount)}
        </strong>
      </div>

      ${
        createdAt
          ? `
            <div class="tracking-row">
              <span>تاریخ ثبت</span>
              <strong>
                ${escapeHTML(
                  formatDate(
                    createdAt
                  )
                )}
              </strong>
            </div>
          `
          : ""
      }

    </div>
  `;
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    "fa-IR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

/* =========================================================
   STATUS
========================================================= */

function statusBadge(status) {
  const normalized =
    normalizeText(
      status
    );

  let text =
    "در انتظار";

  let className =
    "pending";

  if (
    normalized === "running" ||
    normalized === "processing" ||
    normalized === "in_progress"
  ) {
    text =
      "در حال انجام";

    className =
      "running";

  } else if (
    normalized === "done" ||
    normalized === "completed" ||
    normalized === "complete"
  ) {
    text =
      "تکمیل شده";

    className =
      "done";

  } else if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    text =
      "لغو شده";

    className =
      "cancelled";

  } else if (
    normalized === "failed" ||
    normalized === "error"
  ) {
    text =
      "ناموفق";

    className =
      "cancelled";
  }

  return `
    <span class="status-badge ${className}">
      ${text}
    </span>
  `;
}

/* =========================================================
   SERVICES PAGE
========================================================= */

function setupServicesPage() {
  const container =
    document.querySelector(
      "#servicesList, .services-list, [data-services-list]"
    );

  if (!container) {
    return;
  }

  if (
    container.children.length > 0
  ) {
    return;
  }

  Object.entries(
    SERVICES
  ).forEach(
    ([networkKey, network]) => {
      network.items.forEach(
        service => {
          const card =
            document.createElement(
              "div"
            );

          card.className =
            "service-card";

          card.innerHTML = `
            <div class="service-icon">
              ${network.icon}
            </div>

            <h3>
              ${escapeHTML(
                service.name
              )}
            </h3>

            <p>
              ${formatPrice(
                service.price
              )}
              / ۱۰۰۰
            </p>

            <a
              href="order.html?service=${encodeURIComponent(
                service.id
              )}"
              class="btn"
            >
              ثبت سفارش
            </a>
          `;

          container.appendChild(
            card
          );
        }
      );
    }
  );
}

/* =========================================================
   ORDERS PAGE
========================================================= */

function setupOrdersPage() {
  const container =
    document.querySelector(
      "#ordersList, .orders-list, [data-orders]"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="orders-empty">

      <div style="font-size:42px">
        📦
      </div>

      <h3>
        سفارش‌های من
      </h3>

      <p>
        بخش حساب کاربری در حال آماده‌سازی است.
      </p>

      <a
        href="order.html"
        class="btn"
      >
        ثبت سفارش جدید
      </a>

    </div>
  `;
}

/* =========================================================
   LAST ORDER
========================================================= */

function setupLastOrder() {
  let code = null;

  try {
    code =
      localStorage.getItem(
        "followcenter_last_order"
      );
  } catch {}

  if (!code) {
    return;
  }

  const elements =
    document.querySelectorAll(
      "[data-last-order]"
    );

  elements.forEach(
    element => {
      element.textContent =
        code;

      if (
        element.tagName === "A"
      ) {
        element.href =
          `tracking.html?code=${encodeURIComponent(
            code
          )}`;
      }
    }
  );
}

/* =========================================================
   GLOBAL ERRORS
========================================================= */

window.addEventListener(
  "error",
  event => {
    console.error(
      "FollowCenter error:",
      event.error ||
      event.message
    );
  }
);

window.addEventListener(
  "unhandledrejection",
  event => {
    console.error(
      "FollowCenter promise error:",
      event.reason
    );
  }
);

/* =========================================================
   INITIALIZATION
========================================================= */

function initFollowCenter() {
  try {
    setupNavigation();

    setupOrder();

    setupTracking();

    setupServicesPage();

    setupOrdersPage();

    setupLastOrder();

  } catch (error) {
    console.error(
      "FollowCenter initialization error:",
      error
    );
  }
}

/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initFollowCenter
  );
} else {
  initFollowCenter();
     }
