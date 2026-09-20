/* =========================================================
   FollowCenter.ir - Main JavaScript
   Complete replacement for script.js
   ========================================================= */

const API_BASE = 'https://followcenter-api.onrender.com';

/* =========================================================
   SERVICES
   ========================================================= */

const SERVICES = {

    instagram: {
        name: 'Instagram',
        faName: 'اینستاگرام',
        icon: '📸',
        items: [
            {
                id: 'ig_follow',
                name: 'خرید فالوور اینستاگرام',
                price: 150000
            },
            {
                id: 'ig_like',
                name: 'خرید لایک اینستاگرام',
                price: 30000
            },
            {
                id: 'ig_view',
                name: 'خرید ویو اینستاگرام',
                price: 20000
            },
            {
                id: 'ig_story_view',
                name: 'خرید ویو استوری اینستاگرام',
                price: 25000
            },
            {
                id: 'ig_comment',
                name: 'خرید کامنت اینستاگرام',
                price: 80000
            },
            {
                id: 'ig_save',
                name: 'خرید سیو اینستاگرام',
                price: 45000
            },
            {
                id: 'ig_share',
                name: 'خرید اشتراک‌گذاری اینستاگرام',
                price: 45000
            },
            {
                id: 'ig_story_like',
                name: 'خرید لایک استوری اینستاگرام',
                price: 35000
            },
            {
                id: 'ig_live',
                name: 'خرید ویو لایو اینستاگرام',
                price: 60000
            },
            {
                id: 'ig_explore',
                name: 'افزایش بازدید اکسپلور',
                price: 70000
            },
            {
                id: 'ig_impression',
                name: 'افزایش ایمپرشن اینستاگرام',
                price: 30000
            },
            {
                id: 'ig_poll',
                name: 'تعامل نظرسنجی اینستاگرام',
                price: 50000
            }
        ]
    },

    telegram: {
        name: 'Telegram',
        faName: 'تلگرام',
        icon: '✈️',
        items: [
            {
                id: 'tg_channel',
                name: 'افزایش ممبر کانال تلگرام',
                price: 180000
            },
            {
                id: 'tg_group',
                name: 'افزایش ممبر گروه تلگرام',
                price: 180000
            },
            {
                id: 'tg_view',
                name: 'خرید ویو تلگرام',
                price: 25000
            },
            {
                id: 'tg_story',
                name: 'خرید ویو استوری تلگرام',
                price: 30000
            },
            {
                id: 'tg_reaction',
                name: 'خرید ری‌اکشن تلگرام',
                price: 35000
            },
            {
                id: 'tg_like',
                name: 'خرید لایک تلگرام',
                price: 35000
            },
            {
                id: 'tg_share',
                name: 'خرید اشتراک‌گذاری تلگرام',
                price: 30000
            },
            {
                id: 'tg_ads',
                name: 'تبلیغات تلگرام',
                price: 220000
            },
            {
                id: 'tg_poll',
                name: 'تعامل نظرسنجی تلگرام',
                price: 40000
            },
            {
                id: 'tg_premium',
                name: 'خدمات تلگرام پریمیوم',
                price: 260000
            }
        ]
    },

    rubika: {
        name: 'Rubika',
        faName: 'روبیکا',
        icon: '🟣',
        items: [
            {
                id: 'rb_follow',
                name: 'خرید دنبال‌کننده روبیکا',
                price: 140000
            },
            {
                id: 'rb_like',
                name: 'خرید لایک روبیکا',
                price: 30000
            },
            {
                id: 'rb_view',
                name: 'خرید ویو روبیکا',
                price: 20000
            }
        ]
    },

    eitaa: {
        name: 'Eitaa',
        faName: 'ایتا',
        icon: '🔵',
        items: [
            {
                id: 'et_channel',
                name: 'افزایش ممبر کانال ایتا',
                price: 150000
            },
            {
                id: 'et_group',
                name: 'افزایش ممبر گروه ایتا',
                price: 150000
            },
            {
                id: 'et_view',
                name: 'خرید ویو ایتا',
                price: 20000
            },
            {
                id: 'et_ads',
                name: 'تبلیغات ایتا',
                price: 250000
            },
            {
                id: 'et_directory',
                name: 'افزایش بازدید دایرکتوری ایتا',
                price: 80000
            }
        ]
    }
};


/* =========================================================
   ALL SERVICES
   ========================================================= */

const allServices = Object.entries(SERVICES).flatMap(
    ([networkKey, network]) =>
        network.items.map(service => ({
            ...service,
            network: networkKey,
            networkName: network.faName
        }))
);


/* =========================================================
   API SERVICES
   ========================================================= */

let API_SERVICES = [];
let API_SERVICES_LOADED = false;


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) return '';

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function formatPrice(value) {
    const number = Number(value) || 0;

    return number.toLocaleString('fa-IR') + ' تومان';
}


function formatNumber(value) {
    const number = Number(value) || 0;

    return number.toLocaleString('fa-IR');
}


function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase();
}


function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);

    return params.get(name);
}


/* =========================================================
   API FETCH
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
                'Content-Type': 'application/json',
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

            const message =
                data?.message ||
                data?.error ||
                `خطای سرور (${response.status})`;

            throw new Error(message);
        }

        return data;

    } catch (error) {

        if (error.name === 'AbortError') {
            throw new Error('زمان پاسخ سرور تمام شد. دوباره تلاش کنید.');
        }

        throw error;

    } finally {

        clearTimeout(timeout);
    }
}


/* =========================================================
   LOAD SERVICES FROM DATABASE
   ========================================================= */

async function loadApiServices() {

    try {

        const data = await apiFetch(
            `${API_BASE}/api/services`
        );

        if (
            data &&
            data.success &&
            Array.isArray(data.services)
        ) {

            API_SERVICES = data.services.filter(
                service => service.is_active !== false
            );

            API_SERVICES_LOADED = true;

            return API_SERVICES;
        }

        API_SERVICES = [];
        API_SERVICES_LOADED = false;

        return [];

    } catch (error) {

        console.warn(
            'Could not load API services:',
            error
        );

        API_SERVICES = [];
        API_SERVICES_LOADED = false;

        return [];
    }
}


/* =========================================================
   FIND DATABASE SERVICE
   ========================================================= */

function getApiService(serviceCode) {

    if (!serviceCode) return null;

    const code = normalizeText(serviceCode);

    return API_SERVICES.find(service => {

        const possibleCodes = [
            service.service_code,
            service.code,
            service.slug,
            service.key,
            service.serviceCode,
            service.service_id
        ];

        return possibleCodes.some(
            value => normalizeText(value) === code
        );

    }) || null;
}


/* =========================================================
   FIND DATABASE SERVICE ID
   ========================================================= */

function getDatabaseServiceId(serviceCode) {

    const service = getApiService(serviceCode);

    if (!service) return null;

    const id =
        service.id ??
        service.service_id ??
        service.serviceId;

    const numberId = Number(id);

    if (!Number.isFinite(numberId)) {
        return null;
    }

    return numberId;
}


/* =========================================================
   STATIC SERVICE
   ========================================================= */

function getStaticService(serviceCode) {

    return allServices.find(
        service =>
            normalizeText(service.id) ===
            normalizeText(serviceCode)
    ) || null;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const menuButton =
        document.querySelector(
            '#menuToggle, .menu-toggle, .hamburger'
        );

    const nav =
        document.querySelector(
            '#mainNav, .main-nav, nav'
        );

    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', () => {

        nav.classList.toggle('active');

        menuButton.classList.toggle('active');
    });
}


/* =========================================================
   SERVICE CARDS
   ========================================================= */

function setupServiceCards() {

    const containers =
        document.querySelectorAll(
            '[data-service], .service-card'
        );

    containers.forEach(card => {

        card.addEventListener('click', () => {

            const serviceId =
                card.dataset.service ||
                card.dataset.serviceId;

            if (!serviceId) return;

            window.location.href =
                `order.html?service=${encodeURIComponent(serviceId)}`;
        });

    });
}


/* =========================================================
   POPULATE NETWORK SELECT
   ========================================================= */

function populateNetworkSelect(select) {

    if (!select) return;

    select.innerHTML =
        '<option value="">انتخاب شبکه</option>';

    Object.entries(SERVICES).forEach(
        ([key, network]) => {

            const option =
                document.createElement('option');

            option.value = key;

            option.textContent =
                `${network.icon} ${network.faName}`;

            select.appendChild(option);
        }
    );
}


/* =========================================================
   POPULATE SERVICE SELECT
   ========================================================= */

function populateServiceSelect(select, networkKey) {

    if (!select) return;

    select.innerHTML =
        '<option value="">انتخاب سرویس</option>';

    if (!networkKey || !SERVICES[networkKey]) {
        return;
    }

    SERVICES[networkKey].items.forEach(service => {

        const option =
            document.createElement('option');

        option.value = service.id;

        option.textContent =
            service.name;

        option.dataset.price =
            service.price;

        select.appendChild(option);
    });
}


/* =========================================================
   SET PRICE
   ========================================================= */

function updateOrderPrice() {

    const serviceSelect =
        document.querySelector(
            '#service, #serviceSelect, select[name="service"]'
        );

    const quantityInput =
        document.querySelector(
            '#quantity, input[name="quantity"]'
        );

    const priceElement =
        document.querySelector(
            '#totalPrice, #price, .total-price, [data-total-price]'
        );

    if (!serviceSelect || !quantityInput) return;

    const serviceId =
        serviceSelect.value;

    const quantity =
        Number(quantityInput.value) || 0;

    const service =
        getStaticService(serviceId);

    if (!service || quantity <= 0) {

        if (priceElement) {
            priceElement.textContent =
                '۰ تومان';
        }

        return;
    }

    /*
       قیمت‌ها برای 1000 واحد هستند.
    */

    const total =
        Math.ceil(
            (service.price * quantity) / 1000
        );

    if (priceElement) {

        priceElement.textContent =
            formatPrice(total);
    }

    const hiddenPrice =
        document.querySelector(
            '#total, input[name="total"]'
        );

    if (hiddenPrice) {
        hiddenPrice.value = total;
    }
}


/* =========================================================
   ORDER PAGE
   ========================================================= */

async function setupOrder() {

    const orderForm =
        document.querySelector(
            '#orderForm, form[data-order-form]'
        );

    if (!orderForm) return;

    const networkSelect =
        document.querySelector(
            '#network, #networkSelect, select[name="network"]'
        );

    const serviceSelect =
        document.querySelector(
            '#service, #serviceSelect, select[name="service"]'
        );

    const quantityInput =
        document.querySelector(
            '#quantity, input[name="quantity"]'
        );

    const linkInput =
        document.querySelector(
            '#link, input[name="link"], input[type="url"]'
        );

    const phoneInput =
        document.querySelector(
            '#phone, input[name="phone"], input[type="tel"]'
        );

    const notesInput =
        document.querySelector(
            '#notes, textarea[name="notes"]'
        );

    const messageElement =
        document.querySelector(
            '#orderMessage, #message, .order-message'
        );

    const submitButton =
        orderForm.querySelector(
            'button[type="submit"]'
        );


    /* Load database services */

    await loadApiServices();


    /* Network */

    if (networkSelect) {

        populateNetworkSelect(networkSelect);

        networkSelect.addEventListener(
            'change',
            () => {

                populateServiceSelect(
                    serviceSelect,
                    networkSelect.value
                );

                updateOrderPrice();
            }
        );
    }


    /* Service */

    if (serviceSelect) {

        serviceSelect.addEventListener(
            'change',
            updateOrderPrice
        );
    }


    /* Quantity */

    if (quantityInput) {

        quantityInput.addEventListener(
            'input',
            updateOrderPrice
        );
    }


    /* URL service parameter */

    const requestedService =
        getQueryParam('service');

    if (requestedService && serviceSelect) {

        const staticService =
            getStaticService(requestedService);

        if (staticService && networkSelect) {

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


    /* Submit */

    orderForm.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.oldText =
                    submitButton.textContent;

                submitButton.textContent =
                    'در حال ثبت سفارش...';
            }


            if (messageElement) {
                messageElement.textContent = '';
                messageElement.className =
                    'order-message';
            }


            try {

                const selectedService =
                    serviceSelect?.value;

                const quantity =
                    Number(quantityInput?.value);

                const link =
                    linkInput?.value.trim();

                const phone =
                    phoneInput?.value.trim();

                const notes =
                    notesInput?.value.trim() || '';


                /* Validation */

                if (!selectedService) {
                    throw new Error(
                        'لطفاً سرویس را انتخاب کنید.'
                    );
                }

                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {
                    throw new Error(
                        'لطفاً تعداد صحیح وارد کنید.'
                    );
                }

                if (!link) {
                    throw new Error(
                        'لطفاً لینک موردنظر را وارد کنید.'
                    );
                }

                if (!phone) {
                    throw new Error(
                        'لطفاً شماره موبایل را وارد کنید.'
                    );
                }


                /*
                   Find database service.
                */

                let apiService =
                    getApiService(selectedService);


                /*
                   If service wasn't loaded,
                   load again.
                */

                if (!apiService) {

                    await loadApiServices();

                    apiService =
                        getApiService(
                            selectedService
                        );
                }


                /*
                   IMPORTANT:
                   Send DATABASE ID, not static ID.
                */

                const databaseServiceId =
                    apiService
                        ? Number(
                            apiService.id ??
                            apiService.service_id ??
                            apiService.serviceId
                        )
                        : null;


                if (
                    !apiService ||
                    !Number.isFinite(
                        databaseServiceId
                    )
                ) {

                    throw new Error(
                        'سرویس انتخاب شده در سرور پیدا نشد. لطفاً صفحه را تازه‌سازی کنید و دوباره تلاش کنید.'
                    );
                }


                /* Order data */

                const orderData = {

                    serviceId:
                        databaseServiceId,

                    quantity:
                        quantity,

                    link:
                        link,

                    phone:
                        phone,

                    notes:
                        notes
                };


                /* Send order */

                const result =
                    await apiFetch(
                        `${API_BASE}/api/orders`,
                        {
                            method: 'POST',
                            body:
                                JSON.stringify(
                                    orderData
                                )
                        }
                    );


                /*
                   Success
                */

                if (
                    result &&
                    (
                        result.success === true ||
                        result.order ||
                        result.orderCode ||
                        result.code
                    )
                ) {

                    const order =
                        result.order || {};

                    const orderCode =
                        result.orderCode ||
                        result.code ||
                        order.order_code ||
                        order.orderCode ||
                        order.code ||
                        '';


                    if (messageElement) {

                        messageElement.className =
                            'order-message success';

                        messageElement.innerHTML =
                            `
                            <div>
                                <strong>✅ سفارش با موفقیت ثبت شد</strong>
                            </div>

                            ${
                                orderCode
                                    ? `
                                    <div style="margin-top:8px">
                                        کد پیگیری:
                                        <strong>${escapeHTML(orderCode)}</strong>
                                    </div>
                                    `
                                    : ''
                            }
                            `;
                    }


                    /*
                       Save last order code
                    */

                    if (orderCode) {

                        try {

                            localStorage.setItem(
                                'followcenter_last_order',
                                orderCode
                            );

                        } catch {}
                    }


                    /*
                       Reset form
                    */

                    orderForm.reset();

                    if (serviceSelect) {
                        serviceSelect.innerHTML =
                            '<option value="">انتخاب سرویس</option>';
                    }

                    if (networkSelect) {
                        networkSelect.value = '';
                    }

                    updateOrderPrice();


                    /*
                       Optional redirect to tracking
                    */

                    if (orderCode) {

                        setTimeout(() => {

                            window.location.href =
                                `tracking.html?code=${encodeURIComponent(orderCode)}`;

                        }, 1800);
                    }

                } else {

                    throw new Error(
                        result?.message ||
                        result?.error ||
                        'ثبت سفارش انجام نشد.'
                    );
                }

            } catch (error) {

                console.error(
                    'Order error:',
                    error
                );


                if (messageElement) {

                    messageElement.className =
                        'order-message error';

                    messageElement.textContent =
                        `❌ ${error.message}`;
                }

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        submitButton.dataset.oldText ||
                        'ثبت سفارش';
                }
            }

        }
    );
}


/* =========================================================
   TRACKING PAGE
   ========================================================= */

async function setupTracking() {

    const form =
        document.querySelector(
            '#trackingForm, form[data-tracking-form]'
        );

    const input =
        document.querySelector(
            '#trackingCode, #orderCode, input[name="trackingCode"], input[name="code"]'
        );

    const resultElement =
        document.querySelector(
            '#trackingResult, #result, .tracking-result'
        );

    if (!form || !input) return;


    /*
       Read code from URL
    */

    const urlCode =
        getQueryParam('code') ||
        getQueryParam('order');

    if (urlCode) {

        input.value =
            urlCode;

        setTimeout(() => {
            searchOrder(urlCode);
        }, 200);
    }


    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            const code =
                input.value.trim();

            await searchOrder(code);
        }
    );


    async function searchOrder(code) {

        if (!code) {

            showTrackingError(
                'لطفاً کد پیگیری را وارد کنید.'
            );

            return;
        }


        /*
           Accept:
           FC-123456
           fc-123456
        */

        const normalizedCode =
            code.toUpperCase();


        if (
            !/^FC-\d{6}$/.test(
                normalizedCode
            )
        ) {

            showTrackingError(
                'کد پیگیری باید مانند FC-123456 باشد.'
            );

            return;
        }


        if (resultElement) {

            resultElement.innerHTML =
                '<p>⏳ در حال دریافت اطلاعات سفارش...</p>';
        }


        try {

            const data =
                await apiFetch(
                    `${API_BASE}/api/orders/${encodeURIComponent(normalizedCode)}`
                );


            const order =
                data?.order ||
                data?.data ||
                data;


            if (
                !data ||
                data.success === false ||
                !order
            ) {

                throw new Error(
                    data?.message ||
                    data?.error ||
                    'سفارش پیدا نشد.'
                );
            }


            renderTrackingResult(
                order,
                normalizedCode
            );

        } catch (error) {

            console.error(
                'Tracking error:',
                error
            );

            showTrackingError(
                error.message ||
                'خطا در دریافت سفارش.'
            );
        }
    }


    function showTrackingError(message) {

        if (!resultElement) return;

        resultElement.innerHTML =
            `
            <div class="tracking-error">
                ❌ ${escapeHTML(message)}
            </div>
            `;
    }


    function renderTrackingResult(
        order,
        fallbackCode
    ) {

        if (!resultElement) return;


        const code =
            order.order_code ||
            order.orderCode ||
            order.code ||
            fallbackCode;


        const network =
            order.network_name ||
            order.networkName ||
            order.network ||
            '-';


        const service =
            order.service_name ||
            order.serviceName ||
            order.service ||
            '-';


        const quantity =
            order.quantity ||
            0;


        const amount =
            order.amount ??
            order.total_amount ??
            order.totalAmount ??
            order.price ??
            0;


        const status =
            order.status ||
            'pending';


        const createdAt =
            order.created_at ||
            order.createdAt ||
            order.date ||
            '';


        resultElement.innerHTML =
            `
            <div class="tracking-card">

                <div class="tracking-header">
                    <h3>📦 اطلاعات سفارش</h3>

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
                                    formatDate(createdAt)
                                )}
                            </strong>
                        </div>
                        `
                        : ''
                }

            </div>
            `;
    }
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) return '-';

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        'fa-IR',
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }
    );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function statusBadge(status) {

    const normalized =
        normalizeText(status);


    let text =
        'در انتظار';

    let className =
        'pending';


    if (
        normalized === 'running' ||
        normalized === 'processing' ||
        normalized === 'in_progress'
    ) {

        text =
            'در حال انجام';

        className =
            'running';

    } else if (
        normalized === 'done' ||
        normalized === 'completed' ||
        normalized === 'complete'
    ) {

        text =
            'تکمیل شده';

        className =
            'done';

    } else if (
        normalized === 'cancelled' ||
        normalized === 'canceled'
    ) {

        text =
            'لغو شده';

        className =
            'cancelled';

    } else if (
        normalized === 'failed' ||
        normalized === 'error'
    ) {

        text =
            'ناموفق';

        className =
            'cancelled';

    } else if (
        normalized === 'pending' ||
        normalized === 'waiting'
    ) {

        text =
            'در انتظار';

        className =
            'pending';
    }


    return `
        <span class="status-badge ${className}">
            ${text}
        </span>
    `;
}


/* =========================================================
   CUSTOMER ORDERS PAGE
   ========================================================= */

function setupOrdersPage() {

    const container =
        document.querySelector(
            '#ordersList, .orders-list, [data-orders]'
        );

    if (!container) return;

    renderOrders(container);
}


function renderOrders(container) {

    container.innerHTML =
        `
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
   SERVICE LIST PAGE
   ========================================================= */

function setupServicesPage() {

    const container =
        document.querySelector(
            '#servicesList, .services-list, [data-services-list]'
        );

    if (!container) return;


    /*
       If the HTML already contains service cards,
       don't destroy them.
    */

    if (container.children.length > 0) {
        return;
    }


    Object.entries(SERVICES)
        .forEach(
            ([networkKey, network]) => {

                network.items.forEach(
                    service => {

                        const card =
                            document.createElement(
                                'div'
                            );

                        card.className =
                            'service-card';

                        card.innerHTML =
                            `
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
                                href="order.html?service=${encodeURIComponent(service.id)}"
                                class="btn"
                            >
                                ثبت سفارش
                            </a>
                            `;

                        container.appendChild(card);
                    }
                );
            }
        );
}


/* =========================================================
   LAST ORDER
   ========================================================= */

function setupLastOrder() {

    let code = null;

    try {

        code =
            localStorage.getItem(
                'followcenter_last_order'
            );

    } catch {}


    if (!code) return;


    const elements =
        document.querySelectorAll(
            '[data-last-order]'
        );


    elements.forEach(element => {

        element.textContent =
            code;

        if (
            element.tagName === 'A'
        ) {

            element.href =
                `tracking.html?code=${encodeURIComponent(code)}`;
        }
    });
}


/* =========================================================
   GLOBAL ERROR HANDLING
   ========================================================= */

window.addEventListener(
    'error',
    event => {

        console.error(
            'FollowCenter error:',
            event.error || event.message
        );
    }
);


window.addEventListener(
    'unhandledrejection',
    event => {

        console.error(
            'FollowCenter promise error:',
            event.reason
        );
    }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initFollowCenter() {

    try {

        setupNavigation();

        setupServiceCards();

        setupServicesPage();

        setupOrdersPage();

        setupLastOrder();

        await setupOrder();

        await setupTracking();

    } catch (error) {

        console.error(
            'FollowCenter initialization error:',
            error
        );
    }
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initFollowCenter
    );

} else {

    initFollowCenter();
                      }
