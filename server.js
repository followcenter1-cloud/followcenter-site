const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 10000;

/* =========================================================
   DATABASE
========================================================= */

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

/* =========================================================
   SECURITY
========================================================= */

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

app.use(
  cors({
    origin: [
      "https://followcenter.ir",
      "https://www.followcenter.ir",
      "https://followcenter-site.onrender.com"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(
  express.json({
    limit: "50kb"
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "تعداد درخواست‌ها زیاد است. چند دقیقه بعد دوباره تلاش کنید."
  }
});

app.use("/api/", apiLimiter);

/* =========================================================
   SERVICE CATALOG
========================================================= */

const SERVICES = [
  /* ===================== INSTAGRAM ===================== */

  [
    "ig_follow",
    "instagram",
    "خرید فالوور اینستاگرام",
    150000,
    10,
    5000000,
    "افزایش فالوور اینستاگرام"
  ],
  [
    "ig_like",
    "instagram",
    "خرید لایک اینستاگرام",
    30000,
    10,
    1000000,
    "افزایش لایک اینستاگرام"
  ],
  [
    "ig_view",
    "instagram",
    "خرید ویو اینستاگرام",
    20000,
    100,
    10000000,
    "افزایش ویو اینستاگرام"
  ],
  [
    "ig_story_view",
    "instagram",
    "خرید ویو استوری اینستاگرام",
    25000,
    100,
    1000000,
    "افزایش ویو استوری"
  ],
  [
    "ig_comment",
    "instagram",
    "خرید کامنت اینستاگرام",
    80000,
    10,
    100000,
    "افزایش کامنت اینستاگرام"
  ],
  [
    "ig_save",
    "instagram",
    "خرید سیو اینستاگرام",
    45000,
    10,
    500000,
    "افزایش ذخیره پست"
  ],
  [
    "ig_share",
    "instagram",
    "خرید اشتراک‌گذاری اینستاگرام",
    45000,
    10,
    500000,
    "افزایش اشتراک‌گذاری پست"
  ],
  [
    "ig_story_like",
    "instagram",
    "خرید لایک استوری اینستاگرام",
    35000,
    10,
    500000,
    "افزایش لایک استوری"
  ],
  [
    "ig_live",
    "instagram",
    "خرید ویو لایو اینستاگرام",
    60000,
    10,
    100000,
    "افزایش بازدید لایو"
  ],
  [
    "ig_explore",
    "instagram",
    "افزایش بازدید اکسپلور",
    70000,
    1,
    100,
    "خدمات اکسپلور"
  ],
  [
    "ig_impression",
    "instagram",
    "افزایش ایمپرشن اینستاگرام",
    30000,
    100,
    10000000,
    "افزایش ایمپرشن"
  ],
  [
    "ig_poll",
    "instagram",
    "تعامل نظرسنجی اینستاگرام",
    50000,
    10,
    100000,
    "تعامل نظرسنجی"
  ],
  [
    "ig_video_view",
    "instagram",
    "خرید ویو ویدیو اینستاگرام",
    22000,
    100,
    10000000,
    "افزایش ویو ویدیو"
  ],
  [
    "ig_repost",
    "instagram",
    "خرید ری‌پست اینستاگرام",
    50000,
    10,
    500000,
    "افزایش ری‌پست"
  ],
  [
    "ig_comment_like",
    "instagram",
    "لایک کامنت اینستاگرام",
    40000,
    10,
    100000,
    "افزایش لایک کامنت"
  ],
  [
    "ig_channel_member",
    "instagram",
    "عضو کانال اینستاگرام",
    160000,
    10,
    500000,
    "افزایش اعضای کانال"
  ],

  /* ===================== TELEGRAM ===================== */

  [
    "tg_channel",
    "telegram",
    "افزایش ممبر کانال تلگرام",
    180000,
    10,
    1000000,
    "افزایش اعضای کانال"
  ],
  [
    "tg_group",
    "telegram",
    "افزایش ممبر گروه تلگرام",
    180000,
    10,
    1000000,
    "افزایش اعضای گروه"
  ],
  [
    "tg_view",
    "telegram",
    "خرید ویو تلگرام",
    25000,
    100,
    10000000,
    "افزایش بازدید پست"
  ],
  [
    "tg_story",
    "telegram",
    "خرید ویو استوری تلگرام",
    30000,
    100,
    1000000,
    "افزایش بازدید استوری"
  ],
  [
    "tg_reaction",
    "telegram",
    "خرید ری‌اکشن تلگرام",
    35000,
    10,
    1000000,
    "افزایش ری‌اکشن"
  ],
  [
    "tg_like",
    "telegram",
    "خرید لایک تلگرام",
    35000,
    10,
    1000000,
    "افزایش لایک"
  ],
  [
    "tg_share",
    "telegram",
    "خرید اشتراک‌گذاری تلگرام",
    30000,
    10,
    500000,
    "افزایش اشتراک‌گذاری"
  ],
  [
    "tg_ads",
    "telegram",
    "تبلیغات تلگرام",
    220000,
    1,
    1000,
    "خدمات تبلیغات تلگرام"
  ],
  [
    "tg_poll",
    "telegram",
    "رأی نظرسنجی تلگرام",
    40000,
    10,
    100000,
    "افزایش رأی نظرسنجی"
  ],
  [
    "tg_premium",
    "telegram",
    "خدمات تلگرام پریمیوم",
    260000,
    10,
    100000,
    "خدمات پریمیوم"
  ],
  [
    "tg_story_like",
    "telegram",
    "لایک استوری تلگرام",
    30000,
    10,
    500000,
    "افزایش لایک استوری"
  ],
  [
    "tg_boost",
    "telegram",
    "بوست تلگرام",
    200000,
    1,
    10000,
    "خدمات بوست کانال"
  ],
  [
    "tg_star",
    "telegram",
    "استار تلگرام",
    400000,
    1,
    100000,
    "خدمات استار تلگرام"
  ],
  [
    "tg_gift",
    "telegram",
    "گیفت تلگرام",
    300000,
    1,
    10000,
    "خدمات گیفت تلگرام"
  ],
  [
    "tg_reaction_positive",
    "telegram",
    "ری‌اکشن مثبت تلگرام",
    20000,
    10,
    1000000,
    "ری‌اکشن مثبت"
  ],
  [
    "tg_reaction_negative",
    "telegram",
    "ری‌اکشن منفی تلگرام",
    20000,
    10,
    1000000,
    "ری‌اکشن منفی"
  ],

  /* ===================== RUBIKA ===================== */

  [
    "rb_follow",
    "rubika",
    "خرید دنبال‌کننده روبیکا",
    140000,
    10,
    1000000,
    "افزایش دنبال‌کننده روبیکا"
  ],
  [
    "rb_like",
    "rubika",
    "خرید لایک روبیکا",
    30000,
    10,
    1000000,
    "افزایش لایک روبیکا"
  ],
  [
    "rb_view",
    "rubika",
    "خرید ویو روبیکا",
    20000,
    100,
    10000000,
    "افزایش بازدید روبیکا"
  ],
  [
    "rb_comment",
    "rubika",
    "خرید کامنت روبیکا",
    50000,
    10,
    100000,
    "افزایش کامنت روبیکا"
  ],
  [
    "rb_share",
    "rubika",
    "خرید اشتراک‌گذاری روبیکا",
    35000,
    10,
    500000,
    "افزایش اشتراک‌گذاری روبیکا"
  ],

  /* ===================== EITAA ===================== */

  [
    "ea_channel",
    "eitaa",
    "افزایش ممبر کانال ایتا",
    150000,
    10,
    1000000,
    "افزایش اعضای کانال ایتا"
  ],
  [
    "ea_group",
    "eitaa",
    "افزایش ممبر گروه ایتا",
    150000,
    10,
    1000000,
    "افزایش اعضای گروه ایتا"
  ],
  [
    "ea_view",
    "eitaa",
    "خرید ویو ایتا",
    20000,
    100,
    10000000,
    "افزایش بازدید ایتا"
  ],
  [
    "ea_ads",
    "eitaa",
    "تبلیغات ایتا",
    250000,
    1,
    1000,
    "خدمات تبلیغات ایتا"
  ],
  [
    "ea_directory",
    "eitaa",
    "افزایش بازدید دایرکتوری ایتا",
    80000,
    1,
    1000,
    "خدمات دایرکتوری ایتا"
  ],
  [
    "ea_like",
    "eitaa",
    "خرید لایک ایتا",
    30000,
    10,
    1000000,
    "افزایش لایک ایتا"
  ],
  [
    "ea_comment",
    "eitaa",
    "خرید کامنت ایتا",
    50000,
    10,
    100000,
    "افزایش کامنت ایتا"
  ]
];

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value, maxLength = 2000) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, maxLength);
}

function cleanPhone(value) {
  return cleanString(value, 30)
    .replace(/[^\d+]/g, "");
}

function cleanServiceCode(value) {
  return cleanString(value, 100)
    .toLowerCase();
}

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function normalizeOrderCode(value) {
  return cleanString(value, 50).toUpperCase();
}

function makeOrderCode() {
  return `FC-${Math.floor(
    100000 + Math.random() * 900000
  )}`;
}

async function createUniqueOrderCode(client) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const code = makeOrderCode();

    const result = await client.query(
      `
      SELECT id
      FROM orders
      WHERE order_code = $1
      LIMIT 1
      `,
      [code]
    );

    if (result.rowCount === 0) {
      return code;
    }
  }

  throw new Error(
    "Unable to generate a unique order code."
  );
}

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(30),
        email VARCHAR(255),
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_code VARCHAR(100),
        network VARCHAR(50),
        name TEXT,
        price NUMERIC(14,2) DEFAULT 0,
        price_per_1000 NUMERIC(14,2) DEFAULT 0,
        min_quantity INTEGER DEFAULT 1,
        max_quantity INTEGER DEFAULT 100000000,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_code VARCHAR(50),
        user_id INTEGER,
        service_id INTEGER,
        quantity INTEGER,
        link TEXT,
        target_url TEXT,
        phone VARCHAR(30),
        notes TEXT,
        amount NUMERIC(14,2),
        total_price NUMERIC(14,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        amount NUMERIC(14,2),
        status VARCHAR(50),
        gateway VARCHAR(100),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(100),
        entity_type VARCHAR(100),
        entity_id INTEGER,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const serviceColumns = [
      ["service_code", "VARCHAR(100)"],
      ["network", "VARCHAR(50)"],
      ["name", "TEXT"],
      ["price", "NUMERIC(14,2)"],
      ["price_per_1000", "NUMERIC(14,2)"],
      ["min_quantity", "INTEGER"],
      ["max_quantity", "INTEGER"],
      ["description", "TEXT"],
      ["is_active", "BOOLEAN"],
      ["created_at", "TIMESTAMP"],
      ["updated_at", "TIMESTAMP"]
    ];

    for (const [column, type] of serviceColumns) {
      await client.query(`
        ALTER TABLE services
        ADD COLUMN IF NOT EXISTS ${column} ${type}
      `);
    }

    const orderColumns = [
      ["order_code", "VARCHAR(50)"],
      ["user_id", "INTEGER"],
      ["service_id", "INTEGER"],
      ["quantity", "INTEGER"],
      ["link", "TEXT"],
      ["target_url", "TEXT"],
      ["phone", "VARCHAR(30)"],
      ["notes", "TEXT"],
      ["amount", "NUMERIC(14,2)"],
      ["total_price", "NUMERIC(14,2)"],
      ["status", "VARCHAR(50)"],
      ["created_at", "TIMESTAMP"]
    ];

    for (const [column, type] of orderColumns) {
      await client.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS ${column} ${type}
      `);
    }

    await client.query(`
      ALTER TABLE services
      ALTER COLUMN price TYPE NUMERIC(14,2)
      USING COALESCE(price, 0)::NUMERIC(14,2)
    `);

    await client.query(`
      ALTER TABLE services
      ALTER COLUMN price_per_1000 TYPE NUMERIC(14,2)
      USING COALESCE(price_per_1000, 0)::NUMERIC(14,2)
    `);

    await client.query(`
      ALTER TABLE orders
      ALTER COLUMN amount TYPE NUMERIC(14,2)
      USING COALESCE(amount, 0)::NUMERIC(14,2)
    `);

    await client.query(`
      ALTER TABLE orders
      ALTER COLUMN total_price TYPE NUMERIC(14,2)
      USING COALESCE(total_price, 0)::NUMERIC(14,2)
    `);

    await client.query(`
      UPDATE services
      SET
        price = COALESCE(price, 0),
        price_per_1000 = COALESCE(price_per_1000, price, 0),
        min_quantity = COALESCE(min_quantity, 1),
        max_quantity = COALESCE(max_quantity, 100000000),
        is_active = COALESCE(is_active, TRUE),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    `);

    await client.query(`
      UPDATE orders
      SET
        link = COALESCE(link, target_url),
        target_url = COALESCE(target_url, link),
        amount = COALESCE(amount, total_price, 0),
        total_price = COALESCE(total_price, amount, 0),
        status = COALESCE(status, 'pending'),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
    `);

    for (const service of SERVICES) {
      const [
        code,
        network,
        name,
        price,
        minQuantity,
        maxQuantity,
        description
      ] = service;

      const existing = await client.query(
        `
        SELECT id
        FROM services
        WHERE LOWER(TRIM(service_code)) = $1
        ORDER BY id ASC
        LIMIT 1
        `,
        [code.toLowerCase()]
      );

      if (existing.rowCount > 0) {
        await client.query(
          `
          UPDATE services
          SET
            service_code = $1,
            network = $2,
            name = $3,
            price = $4::NUMERIC(14,2),
            price_per_1000 = $4::NUMERIC(14,2),
            min_quantity = $5::INTEGER,
            max_quantity = $6::INTEGER,
            description = $7,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8::INTEGER
          `,
          [
            code,
            network,
            name,
            String(price),
            minQuantity,
            maxQuantity,
            description,
            existing.rows[0].id
          ]
        );
      } else {
        await client.query(
          `
          INSERT INTO services (
            service_code,
            network,
            name,
            price,
            price_per_1000,
            min_quantity,
            max_quantity,
            description,
            is_active,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4::NUMERIC(14,2),
            $4::NUMERIC(14,2),
            $5::INTEGER,
            $6::INTEGER,
            $7,
            TRUE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          `,
          [
            code,
            network,
            name,
            String(price),
            minQuantity,
            maxQuantity,
            description
          ]
        );
      }
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_services_service_code
      ON services(service_code)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_services_network
      ON services(network)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_orders_order_code
      ON orders(order_code)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_orders_service_id
      ON orders(service_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_orders_created_at
      ON orders(created_at)
    `);

    await client.query("COMMIT");

    console.log(
      `Database initialized successfully. ${SERVICES.length} services are ready.`
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error(
      "Database initialization failed:",
      error
    );

    throw error;
  } finally {
    client.release();
  }
}

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FollowCenter API is running.",
    status: "online"
  });
});

/* =========================================================
   API
========================================================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message:
      "FollowCenter API and database are working.",
    status: "online"
  });
});

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    console.error(
      "Health check error:",
      error
    );

    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "unavailable"
    });
  }
});

/* =========================================================
   SERVICES
========================================================= */

app.get("/api/services", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        service_code,
        network,
        name,
        price,
        price_per_1000,
        min_quantity,
        max_quantity,
        description,
        is_active
      FROM services
      WHERE is_active = TRUE
      ORDER BY
        CASE network
          WHEN 'instagram' THEN 1
          WHEN 'telegram' THEN 2
          WHEN 'rubika' THEN 3
          WHEN 'eitaa' THEN 4
          ELSE 5
        END,
        id ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      services: result.rows
    });
  } catch (error) {
    console.error(
      "Services API error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "خطا در دریافت سرویس‌ها."
    });
  }
});

/* =========================================================
   CREATE ORDER
   IMPORTANT:
   This endpoint accepts BOTH:
   - serviceCode
   - serviceId

   Frontend will use serviceCode.
========================================================= */

app.post("/api/orders", async (req, res) => {
  try {
    const serviceCode =
      cleanServiceCode(
        req.body.serviceCode
      );

    const rawServiceId =
      req.body.serviceId;

    const serviceId =
      Number(rawServiceId);

    const quantity =
      Number(req.body.quantity);

    const link =
      cleanString(req.body.link, 2000);

    const phone =
      cleanPhone(req.body.phone);

    const notes =
      cleanString(req.body.notes, 1000);

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !serviceCode &&
      (!Number.isInteger(serviceId) ||
        serviceId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "سرویس انتخاب‌شده معتبر نیست."
      });
    }

    if (
      serviceCode &&
      !/^[a-z0-9_]+$/i.test(serviceCode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "کد سرویس معتبر نیست."
      });
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "تعداد سفارش معتبر نیست."
      });
    }

    if (
      !link ||
      !isValidUrl(link)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "لینک واردشده معتبر نیست."
      });
    }

    if (
      !phone ||
      phone.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "شماره تماس معتبر نیست."
      });
    }

    /* =====================================================
       FIND SERVICE

       serviceCode has priority.
       This is the important fix.
    ===================================================== */

    let serviceResult;

    if (serviceCode) {
      serviceResult =
        await pool.query(
          `
          SELECT
            id,
            service_code,
            network,
            name,
            price,
            price_per_1000,
            min_quantity,
            max_quantity,
            description
          FROM services
          WHERE LOWER(TRIM(service_code)) = $1
          AND is_active = TRUE
          ORDER BY id ASC
          LIMIT 1
          `,
          [serviceCode]
        );
    } else {
      serviceResult =
        await pool.query(
          `
          SELECT
            id,
            service_code,
            network,
            name,
            price,
            price_per_1000,
            min_quantity,
            max_quantity,
            description
          FROM services
          WHERE id = $1::INTEGER
          AND is_active = TRUE
          LIMIT 1
          `,
          [serviceId]
        );
    }

    if (
      serviceResult.rowCount === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "سرویس پیدا نشد یا غیرفعال است."
      });
    }

    const service =
      serviceResult.rows[0];

    /* =====================================================
       QUANTITY
    ===================================================== */

    const minQuantity =
      Number(
        service.min_quantity
      ) || 1;

    const maxQuantity =
      Number(
        service.max_quantity
      ) || 100000000;

    if (
      quantity < minQuantity ||
      quantity > maxQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          `تعداد سفارش باید بین ${minQuantity.toLocaleString("fa-IR")} و ${maxQuantity.toLocaleString("fa-IR")} باشد.`
      });
    }

    /* =====================================================
       PRICE
    ===================================================== */

    const pricePer1000 =
      Number(
        service.price_per_1000 ??
        service.price ??
        0
      );

    if (
      !Number.isFinite(
        pricePer1000
      ) ||
      pricePer1000 < 0
    ) {
      return res.status(500).json({
        success: false,
        message:
          "قیمت سرویس معتبر نیست."
      });
    }

    const totalPrice =
      Math.ceil(
        (pricePer1000 * quantity) /
          1000
      );

    if (
      !Number.isFinite(
        totalPrice
      ) ||
      totalPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "مبلغ سفارش معتبر نیست."
      });
    }

    /* =====================================================
       INSERT ORDER
    ===================================================== */

    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      const orderCode =
        await createUniqueOrderCode(
          client
        );

      const insertResult =
        await client.query(
          `
          INSERT INTO orders (
            order_code,
            user_id,
            service_id,
            quantity,
            link,
            target_url,
            phone,
            notes,
            amount,
            total_price,
            status,
            created_at
          )
          VALUES (
            $1,
            NULL,
            $2::INTEGER,
            $3::INTEGER,
            $4,
            $4,
            $5,
            $6,
            $7::NUMERIC(14,2),
            $7::NUMERIC(14,2),
            'pending',
            CURRENT_TIMESTAMP
          )
          RETURNING
            id,
            order_code,
            service_id,
            quantity,
            amount,
            total_price,
            status,
            created_at
          `,
          [
            orderCode,
            service.id,
            quantity,
            link,
            phone,
            notes || null,
            String(totalPrice)
          ]
        );

      await client.query(
        "COMMIT"
      );

      const order =
        insertResult.rows[0];

      console.log(
        `Order created successfully: ${order.order_code}`
      );

      return res.status(201).json({
        success: true,
        message:
          "سفارش با موفقیت ثبت شد.",
        orderCode:
          order.order_code,
        code:
          order.order_code,
        order: {
          id:
            order.id,
          code:
            order.order_code,
          order_code:
            order.order_code,
          service:
            service.name,
          service_name:
            service.name,
          serviceCode:
            service.service_code,
          service_code:
            service.service_code,
          network:
            service.network,
          quantity:
            Number(order.quantity),
          amount:
            Number(order.amount),
          total_price:
            Number(order.total_price),
          status:
            order.status,
          createdAt:
            order.created_at,
          created_at:
            order.created_at
        }
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {}

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید."
    });
  }
});

/* =========================================================
   TRACK ORDER
========================================================= */

app.get(
  "/api/orders/:code",
  async (req, res) => {
    try {
      const code =
        normalizeOrderCode(
          req.params.code
        );

      if (
        !/^FC-\d{6}$/.test(code)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "کد سفارش معتبر نیست."
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            o.id,
            o.order_code,
            o.quantity,

            COALESCE(
              o.amount,
              o.total_price,
              0
            )::NUMERIC(14,2) AS amount,

            COALESCE(
              o.total_price,
              o.amount,
              0
            )::NUMERIC(14,2) AS total_price,

            COALESCE(
              o.status,
              'pending'
            ) AS status,

            o.created_at,

            s.name AS service_name,
            s.service_code,
            s.network

          FROM orders o

          LEFT JOIN services s
            ON s.id = o.service_id

          WHERE UPPER(
            TRIM(o.order_code)
          ) = $1

          LIMIT 1
          `,
          [code]
        );

      if (
        result.rowCount === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "سفارشی با این کد پیدا نشد."
        });
      }

      const row =
        result.rows[0];

      const order = {
        id:
          row.id,
        code:
          row.order_code,
        order_code:
          row.order_code,
        service:
          row.service_name,
        service_name:
          row.service_name,
        serviceCode:
          row.service_code,
        service_code:
          row.service_code,
        network:
          row.network,
        network_name:
          row.network,
        quantity:
          Number(
            row.quantity || 0
          ),
        amount:
          Number(
            row.amount || 0
          ),
        total_price:
          Number(
            row.total_price || 0
          ),
        status:
          row.status || "pending",
        createdAt:
          row.created_at,
        created_at:
          row.created_at
      };

      return res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error(
        "Tracking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "خطا در پیگیری سفارش."
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "مسیر موردنظر پیدا نشد."
    });
  }
);

/* =========================================================
   GLOBAL ERROR
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    if (
      res.headersSent
    ) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      message:
        "خطای داخلی سرور."
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    console.log(
      "Starting FollowCenter API..."
    );

    console.log(
      "Initializing database..."
    );

    await initializeDatabase();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `FollowCenter API running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server could not start because database initialization failed."
    );

    process.exit(1);
  }
}

startServer();
