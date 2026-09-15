const API_BASE = 'https://followcenter-api.onrender.com';

const SERVICES = {
  Instagram: {
    icon: '◎',
    items: [
      ['ig_follow', 'فالوور اینستاگرام', 150000],
      ['ig_like', 'لایک اینستاگرام', 30000],
      ['ig_view', 'ویو اینستاگرام', 20000],
      ['ig_story_view', 'ویو استوری اینستاگرام', 25000],
      ['ig_comment', 'کامنت اینستاگرام', 80000],
      ['ig_save', 'سیو پست اینستاگرام', 45000],
      ['ig_share', 'اشتراک‌گذاری پست اینستاگرام', 40000],
      ['ig_story_like', 'لایک استوری اینستاگرام', 35000],
      ['ig_live', 'لایک و بازدید لایو اینستاگرام', 60000],
      ['ig_explore', 'خدمات اکسپلور اینستاگرام', 70000],
      ['ig_impression', 'ایمپرشن اینستاگرام', 30000],
      ['ig_poll', 'رأی نظرسنجی اینستاگرام', 50000]
    ]
  },

  Telegram: {
    icon: '✈',
    items: [
      ['tg_channel', 'ممبر کانال تلگرام', 180000],
      ['tg_group', 'ممبر گروه تلگرام', 180000],
      ['tg_view', 'ویو پست تلگرام', 25000],
      ['tg_story', 'ویو استوری تلگرام', 30000],
      ['tg_reaction', 'ری‌اکشن تلگرام', 35000],
      ['tg_like', 'لایک تلگرام', 35000],
      ['tg_share', 'اشتراک‌گذاری تلگرام', 30000],
      ['tg_ads', 'تبلیغات تلگرام', 220000],
      ['tg_poll', 'رأی نظرسنجی تلگرام', 40000],
      ['tg_premium', 'ممبر پرمیوم تلگرام', 260000]
    ]
  },

  Rubika: {
    icon: '◈',
    items: [
      ['rb_follow', 'فالوور روبیکا', 140000],
      ['rb_like', 'لایک روبیکا', 30000],
      ['rb_view', 'ویو روبیکا', 20000]
    ]
  },

  Eitaa: {
    icon: '✦',
    items: [
      ['et_channel', 'ممبر کانال ایتا', 150000],
      ['et_group', 'ممبر گروه ایتا', 150000],
      ['et_view', 'ویو ایتا', 20000],
      ['et_ads', 'تبلیغات ایتا', 250000],
      ['et_directory', 'ثبت کانال ایتا در دایرکتوری', 80000]
    ]
  }
};

const allServices = Object.entries(SERVICES).flatMap(
  ([network, data]) =>
    data.items.map(([id, name, price]) => ({
      id,
      network,
      name,
      price
    }))
);

const fmt = n =>
  new Intl.NumberFormat('fa-IR').format(Math.round(n)) + ' تومان';

function toast(msg) {
  const el = document.querySelector('#toast');

  if (!el) {
    alert(msg);
    return;
  }

  el.textContent = msg;
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 2800);
}

function initNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');

  if (toggle && menu) {
    toggle.onclick = () => {
      menu.classList.toggle('open');
    };
  }

  const page =
    location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.menu a').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
    }
  });
}

function serviceCards(limit) {
  const host = document.querySelector('#serviceCards');

  if (!host) return;

  const services =
    limit ? allServices.slice(0, limit) : allServices;

  host.innerHTML = services.map(s => `
    <a class="card service-card"
       href="order.html?service=${encodeURIComponent(s.id)}">

      <div class="icon">
        ${SERVICES[s.network].icon}
      </div>

      <h3>${s.name}</h3>

      <div class="price">
        ${fmt(s.price)}
        <small>/ 1K</small>
      </div>

      <span class="network">
        ${s.network}
      </span>

    </a>
  `).join('');
}

function setupOrder() {

  const network =
    document.querySelector('#network');

  const service =
    document.querySelector('#service');

  const qty =
    document.querySelector('#quantity');

  const total =
    document.querySelector('#total');

  const form =
    document.querySelector('#orderForm');

  if (!network || !service || !qty || !form) {
    return;
  }

  /*
   * شبکه‌ها
   */
  network.innerHTML =
    '<option value="">انتخاب شبکه</option>' +
    Object.keys(SERVICES)
      .map(n => `
        <option value="${n}">
          ${
            n === 'Rubika'
              ? 'روبیکا'
              : n === 'Eitaa'
                ? 'ایتا'
                : n
          }
        </option>
      `)
      .join('');

  /*
   * سرویس‌ها
   */
  function fillServices() {

    service.innerHTML =
      '<option value="">انتخاب سرویس</option>' +
      (SERVICES[network.value]?.items || [])
        .map(x => `
          <option value="${x[0]}">
            ${x[1]} — ${fmt(x[2])}/1K
          </option>
        `)
        .join('');

    calculateTotal();
  }

  /*
   * محاسبه قیمت
   */
  function calculateTotal() {

    const selected =
      allServices.find(
        x => x.id === service.value
      );

    const quantity =
      Math.max(0, Number(qty.value) || 0);

    if (!selected || quantity <= 0) {
      total.textContent = '۰ تومان';
      return;
    }

    total.textContent =
      fmt(selected.price * quantity / 1000);
  }

  network.onchange = fillServices;
  service.onchange = calculateTotal;
  qty.oninput = calculateTotal;

  /*
   * انتخاب سرویس از URL
   */
  const qs =
    new URLSearchParams(location.search)
      .get('service');

  if (qs) {

    const selected =
      allServices.find(x => x.id === qs);

    if (selected) {

      network.value = selected.network;

      fillServices();

      service.value = selected.id;

      calculateTotal();
    }
  }

  /*
   * ثبت سفارش واقعی
   */
  form.onsubmit = async e => {

    e.preventDefault();

    const selected =
      allServices.find(
        x => x.id === service.value
      );

    const quantity =
      Number(qty.value);

    const link =
      document.querySelector('#link')
        ?.value.trim() || '';

    const phone =
      document.querySelector('#phone')
        ?.value.trim() || '';

    const notes =
      document.querySelector('#notes')
        ?.value.trim() || '';

    if (!selected || !Number.isInteger(quantity) || quantity < 1) {

      toast(
        'لطفاً شبکه، سرویس و تعداد را درست انتخاب کنید.'
      );

      return;
    }

    if (!link || !phone) {

      toast(
        'لینک و شماره موبایل را وارد کنید.'
      );

      return;
    }

    /*
     * جلوگیری از ارسال دوباره
     */
    const submitButton =
      form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.oldText =
        submitButton.textContent;

      submitButton.textContent =
        'در حال ثبت سفارش...';
    }

    try {

      const response =
        await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            serviceId: selected.id,
            quantity,
            link,
            phone,
            notes
          })
        });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {

        throw new Error(
          data?.message ||
          'ثبت سفارش با خطا مواجه شد.'
        );
      }

      const order =
        data.order;

      const success =
        document.querySelector('#success');

      if (success) {

        success.innerHTML = `
          <div class="notice">

            <strong>
              سفارش با موفقیت ثبت شد ✅
            </strong>

            <br><br>

            کد پیگیری شما:

            <strong>
              ${order.code}
            </strong>

            <br><br>

            مبلغ سفارش:

            <strong>
              ${fmt(order.amount)}
            </strong>

            <br><br>

            این کد را برای پیگیری سفارش خود نگه دارید.

          </div>
        `;

      } else {

        toast(
          `سفارش ثبت شد. کد پیگیری: ${order.code}`
        );
      }

      form.reset();

      service.innerHTML =
        '<option value="">انتخاب سرویس</option>';

      total.textContent =
        '۰ تومان';

    } catch (error) {

      console.error(
        'Order submission error:',
        error
      );

      toast(
        error.message ||
        'ارتباط با سرور برقرار نشد.'
      );

    } finally {

      if (submitButton) {

        submitButton.disabled = false;

        submitButton.textContent =
          submitButton.dataset.oldText ||
          'ثبت سفارش';
      }
    }
  };
}

async function setupTracking() {

  const form =
    document.querySelector('#trackingForm');

  const result =
    document.querySelector('#trackingResult');

  if (!form || !result) {
    return;
  }

  form.onsubmit = async e => {

    e.preventDefault();

    const input =
      document.querySelector('#code');

    const code =
      input?.value.trim().toUpperCase() || '';

    if (!/^FC-\d{6}$/.test(code)) {

      result.innerHTML = `
        <div class="notice">
          کد پیگیری را به شکل
          <strong>FC-123456</strong>
          وارد کنید.
        </div>
      `;

      return;
    }

    result.innerHTML = `
      <div class="notice">
        در حال دریافت اطلاعات سفارش...
      </div>
    `;

    try {

      const response =
        await fetch(
          `${API_BASE}/api/orders/${encodeURIComponent(code)}`
        );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {

        result.innerHTML = `
          <div class="notice">
            ${data?.message || 'سفارش پیدا نشد.'}
          </div>
        `;

        return;
      }

      const o =
        data.order;

      result.innerHTML = `
        <div class="panel card">

          <div class="section-head">

            <div>
              <h2>${o.code}</h2>

              <span class="muted">
                ${new Date(o.date).toLocaleString('fa-IR')}
              </span>
            </div>

            ${statusBadge(o.status)}

          </div>

          <div class="grid">

            <div>
              <span class="muted">
                شبکه
              </span>
              <br>
              <b>${o.network}</b>
            </div>

            <div>
              <span class="muted">
                سرویس
              </span>
              <br>
              <b>${o.service}</b>
            </div>

            <div>
              <span class="muted">
                تعداد
              </span>
              <br>
              <b>
                ${Number(o.quantity)
                  .toLocaleString('fa-IR')}
              </b>
            </div>

            <div>
              <span class="muted">
                مبلغ
              </span>
              <br>
              <b>
                ${fmt(o.amount)}
              </b>
            </div>

          </div>

        </div>
      `;

    } catch (error) {

      console.error(
        'Tracking error:',
        error
      );

      result.innerHTML = `
        <div class="notice">
          ارتباط با سرور برقرار نشد.
          لطفاً دوباره تلاش کنید.
        </div>
      `;
    }
  };
}

function statusBadge(status) {

  const badges = {

    pending:
      '<span class="badge pending">🟡 در انتظار</span>',

    running:
      '<span class="badge running">🔵 در حال انجام</span>',

    done:
      '<span class="badge done">🟢 تکمیل شده</span>',

    cancelled:
      '<span class="badge cancelled">🔴 لغو شده</span>'
  };

  return badges[status] || status;
}

/*
 * صفحه سفارش‌های من
 *
 * فعلاً چون سیستم ورود کاربر هنوز ساخته نشده،
 * سفارش‌ها در این صفحه از سرور نمایش داده نمی‌شوند.
 *
 * این بخش را بعد از ساخت Login/OTP و احراز هویت
 * به شکل امن به حساب کاربر متصل می‌کنیم.
 */
function renderOrders() {

  const body =
    document.querySelector('#ordersBody');

  if (!body) return;

  body.innerHTML = `
    <tr>
      <td colspan="6" class="empty">
        برای مشاهده سفارش‌های حساب کاربری،
        ابتدا سیستم ورود را فعال می‌کنیم.
        <br><br>
        فعلاً می‌توانید با کد پیگیری،
        سفارش خود را از صفحه «پیگیری سفارش»
        بررسی کنید.
      </td>
    </tr>
  `;

  const counts = {
    all: 0,
    pending: 0,
    running: 0,
    done: 0,
    cancelled: 0
  };

  Object.entries(counts).forEach(
    ([key, value]) => {

      const el =
        document.querySelector(
          `[data-count="${key}"]`
        );

      if (el) {
        el.textContent =
          value.toLocaleString('fa-IR');
      }
    }
  );
}

function inject() {

  document
    .querySelectorAll('[data-year]')
    .forEach(x => {
      x.textContent =
        new Date().getFullYear();
    });

  initNav();

  const serviceCardsElement =
    document.querySelector('#serviceCards');

  const limit =
    serviceCardsElement?.dataset.limit
      ? Number(serviceCardsElement.dataset.limit)
      : undefined;

  serviceCards(limit);

  setupOrder();

  renderOrders();

  setupTracking();
}

document.addEventListener(
  'DOMContentLoaded',
  inject
);
