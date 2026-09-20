const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

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
  legacyHeaders: false
});

app.use("/api/", apiLimiter);

/* =========================================================
   SERVICE CATALOG
========================================================= */

const SERVICES = [

  /* =========================
     INSTAGRAM
  ========================= */

  [
    "ig_follow",
    "instagram",
    "فالوور اینستاگرام",
    150000,
    10,
    5000000,
    "افزایش فالوور اینستاگرام"
  ],

  [
    "ig_like",
    "instagram",
    "لایک اینستاگرام",
    30000,
    10,
    1000000,
    "افزایش لایک پست اینستاگرام"
  ],

  [
    "ig_view",
    "instagram",
    "ویو پست اینستاگرام",
    20000,
    100,
    10000000,
    "افزایش بازدید پست اینستاگرام"
  ],

  [
    "ig_story_view",
    "instagram",
    "ویو استوری اینستاگرام",
    25000,
    100,
    1000000,
    "افزایش بازدید استوری"
  ],

  [
    "ig_comment",
    "instagram",
    "کامنت اینستاگرام",
    80000,
    10,
    100000,
    "افزایش کامنت برای پست اینستاگرام"
  ],

  [
    "ig_save",
    "instagram",
    "سیو اینستاگرام",
    45000,
    10,
    500000,
    "افزایش ذخیره پست"
  ],

  [
    "ig_share",
    "instagram",
    "اشتراک‌گذاری اینستاگرام",
    45000,
    10,
    500000,
    "افزایش اشتراک‌گذاری پست"
  ],

  [
    "ig_story_like",
    "instagram",
    "لایک استوری اینستاگرام",
    35000,
    10,
    500000,
    "افزایش لایک استوری"
  ],

  [
    "ig_live",
    "instagram",
    "بازدید لایو اینستاگرام",
    60000,
    10,
    100000,
    "افزایش بازدید لایو"
  ],

  [
    "ig_explore",
    "instagram",
    "اکسپلور اینستاگرام",
    70000,
    1,
    100,
    "خدمات ورود محتوا به اکسپلور"
  ],

  [
    "ig_impression",
    "instagram",
    "ایمپرشن اینستاگرام",
    30000,
    100,
    10000000,
    "افزایش ایمپرشن محتوا"
  ],

  [
    "ig_poll",
    "instagram",
    "رأی نظرسنجی اینستاگرام",
    50000,
    10,
    100000,
    "افزایش رأی در نظرسنجی"
  ],

  [
    "ig_video_view",
    "instagram",
    "ویو ویدیو اینستاگرام",
    22000,
    100,
    10000000,
    "افزایش بازدید ویدیو"
  ],

  [
    "ig_repost",
    "instagram",
    "ری‌پست اینستاگرام",
    50000,
    10,
    500000,
    "افزایش ری‌پست محتوا"
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
    "افزایش اعضای کانال اینستاگرام"
  ],

  /* =========================
     TELEGRAM
  ========================= */

  [
    "tg_channel",
    "telegram",
    "عضو کانال تلگرام",
    180000,
    10,
    1000000,
    "افزایش اعضای کانال تلگرام"
  ],

  [
    "tg_group",
    "telegram",
    "عضو گروه تلگرام",
    180000,
    10,
    1000000,
    "افزایش اعضای گروه تلگرام"
  ],

  [
    "tg_view",
    "telegram",
    "ویو پست تلگرام",
    25000,
    100,
    10000000,
    "افزایش بازدید پست تلگرام"
  ],

  [
    "tg_story",
    "telegram",
    "ویو استوری تلگرام",
    30000,
    100,
    1000000,
    "افزایش بازدید استوری تلگرام"
  ],

  [
    "tg_reaction",
    "telegram",
    "ری‌اکشن تلگرام",
    35000,
    10,
    1000000,
    "افزایش ری‌اکشن پست"
  ],

  [
    "tg_like",
    "telegram",
    "لایک تلگرام",
    35000,
    10,
    1000000,
    "افزایش لایک"
  ],

  [
    "tg_share",
    "telegram",
    "اشتراک‌گذاری تلگرام",
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
    "عضو پریمیوم تلگرام",
    260000,
    10,
    100000,
    "افزایش اعضای پریمیوم"
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
    "ری‌اکشن‌های مثبت"
  ],

  [
    "tg_reaction_negative",
    "telegram",
    "ری‌اکشن منفی تلگرام",
    20000,
    10,
    1000000,
    "ری‌اکشن‌های منفی"
  ],

  /* =========================
     RUBIKA
  ========================= */

  [
    "rb_follow",
    "rubika",
    "فالوور روبیکا",
    140000,
    10,
    1000000,
    "افزایش دنبال‌کننده روبیکا"
  ],

  [
    "rb_like",
    "rubika",
    "لایک روبیکا",
    30000,
    10,
    1000000,
    "افزایش لایک روبیکا"
  ],

  [
    "rb_view",
    "rubika",
    "ویو روبیکا",
    20000,
    100,
    10000000,
    "افزایش بازدید روبیکا"
  ],

  [
    "rb_comment",
    "rubika",
    "کامنت روبیکا",
    50000,
    10,
    100000,
    "افزایش کامنت روبیکا"
  ],

  [
    "rb_share",
    "rubika",
    "اشتراک‌گذاری روبیکا",
    35000,
    10,
    500000,
    "افزایش اشتراک‌گذاری روبیکا"
  ],

  /* =========================
     EITAA
  ========================= */

  [
    "ea_channel",
    "eitaa",
    "عضو کانال ایتا",
    150000,
    10,
    1000000,
    "افزایش اعضای کانال ایتا"
  ],

  [
    "ea_group",
    "eitaa",
    "عضو گروه ایتا",
    150000,
    10,
    1000000,
    "افزایش اعضای گروه ایتا"
  ],

  [
    "ea_view",
    "eitaa",
    "ویو ایتا",
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
    "ثبت در فهرست ایتا",
    80000,
    1,
    1000,
    "ثبت کانال یا محتوا در فهرست"
  ],

  [
    "ea_like",
    "eitaa",
    "لایک ایتا",
    30000,
    10,
    1000000,
    "افزایش لایک ایتا"
  ],

  [
    "ea_comment",
    "eitaa",
    "کامنت ایتا",
    50000,
    10,
    100000,
    "افزایش کامنت ایتا"
  ]
];

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value, max = 2000) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().slice(0, max);
}

function cleanPhone(value) {
  return cleanString(value, 30).replace(/[^\d+]/g, "");
}

function validUrl(value) {
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

function makeOrderCode() {
  return `FC-${Math.floor(
    100000 + Math.random() * 900000
  )}`;
}

async function uniqueOrderCode() {
  for (let i = 0; i < 20; i++) {
    const code = makeOrderCode();

    const result = await pool.query(
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

  throw new Error("Could not generate unique order code.");
}

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* USERS */

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(30),
        email VARCHAR(255),
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* SERVICES */

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
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS service_code VARCHAR(100)
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS network VARCHAR(50)
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS name TEXT
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS price NUMERIC(14,2) DEFAULT 0
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS price_per_1000 NUMERIC(14,2) DEFAULT 0
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT 100000000
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS description TEXT
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    /* ORDERS */

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
      ["created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"]
    ];

    for (const [column, type] of orderColumns) {
      await client.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS ${column} ${type}
      `);
    }

    /* PAYMENTS */

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

    /* AUDIT LOGS */

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

    /* COMPATIBILITY */

    await client.query(`
      UPDATE services
      SET price = price_per_1000
      WHERE price IS NULL
      AND price_per_1000 IS NOT NULL
    `);

    await client.query(`
      UPDATE services
      SET price_per_1000 = price
      WHERE price_per_1000 IS NULL
      AND price IS NOT NULL
    `);

    await client.query(`
      UPDATE orders
      SET target_url = link
      WHERE target_url IS NULL
      AND link IS NOT NULL
    `);

    await client.query(`
      UPDATE orders
      SET amount = total_price
      WHERE amount IS NULL
      AND total_price IS NOT NULL
    `);

    await client.query(`
      UPDATE orders
      SET total_price = amount
      WHERE total_price IS NULL
      AND amount IS NOT NULL
    `);

    await client.query(`
      UPDATE orders
      SET status = 'pending'
      WHERE status IS NULL
    `);

    /* =====================================================
       SEED SERVICES
    ===================================================== */

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
        WHERE service_code = $1
        ORDER BY id ASC
        LIMIT 1
        `,
        [code]
      );

      if (existing.rowCount > 0) {
        await client.query(
          `
          UPDATE services
          SET
            network = $1,
            name = $2,
            price = $3,
            price_per_1000 = $3,
            min_quantity = $4,
            max_quantity = $5,
            description = $6,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $7
          `,
          [
            network,
            name,
            price,
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
            is_active
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $4,
            $5,
            $6,
            $7,
            TRUE
          )
          `,
          [
            code,
            network,
            name,
            price,
            minQuantity,
            maxQuantity,
            description
          ]
        );
      }
    }

    await client.query("COMMIT");

    console.log(
      `Database initialized successfully. ${SERVICES.length} services loaded.`
    );

  } catch (error) {
    await client.query("ROLLBACK");

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
   BASIC API
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FollowCenter API is running.",
    status: "online"
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "FollowCenter API and database are working.",
    status: "online"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      status: "healthy",
      database: "connected"
    });

  } catch (error) {
    console.error("Health check error:", error);

    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "unavailable"
    });
  }
});

/* =========================================================
   SERVICES API
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
    console.error("Services error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در دریافت سرویس‌ها."
    });
  }
});

/* =========================================================
   CREATE ORDER
========================================================= */

app.post("/api/orders", async (req, res) => {
  try {

    const serviceId = Number(req.body.serviceId);
    const quantity = Number(req.body.quantity);

    const link = cleanString(
      req.body.link,
      2000
    );

    const phone = cleanPhone(
      req.body.phone
    );

    const notes = cleanString(
      req.body.notes,
      1000
    );

    if (
      !Number.isInteger(serviceId) ||
      serviceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "سرویس انتخاب‌شده معتبر نیست."
      });
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "تعداد سفارش معتبر نیست."
      });
    }

    if (!link || !validUrl(link)) {
      return res.status(400).json({
        success: false,
        message: "لینک واردشده معتبر نیست."
      });
    }

    if (!phone || phone.length < 8) {
      return res.status(400).json({
        success: false,
        message: "شماره تماس معتبر نیست."
      });
    }

    /* GET SERVICE */

    const serviceResult = await pool.query(
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
      WHERE id = $1
      AND is_active = TRUE
      LIMIT 1
      `,
      [serviceId]
    );

    if (serviceResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "سرویس پیدا نشد یا غیرفعال است."
      });
    }

    const service = serviceResult.rows[0];

    const minQuantity =
      Number(service.min_quantity || 1);

    const maxQuantity =
      Number(service.max_quantity || 100000000);

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

    const unitPrice =
      Number(
        service.price_per_1000 ??
        service.price ??
        0
      );

    const totalPrice = Math.round(
      (unitPrice * quantity) / 1000
    );

    if (
      !Number.isFinite(totalPrice) ||
      totalPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "قیمت سفارش معتبر نیست."
      });
    }

    /* CREATE ORDER CODE */

    const orderCode =
      await uniqueOrderCode();

    /* INSERT ORDER */

    const result = await pool.query(
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
        status
      )
      VALUES (
        $1,
        NULL,
        $2,
        $3,
        $4,
        $4,
        $5,
        $6,
        $7,
        $7,
        'pending'
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
        totalPrice
      ]
    );

    const order =
      result.rows[0];

    console.log(
      `Order created successfully: ${order.order_code}`
    );

    res.status(201).json({
      success: true,
      message: "سفارش با موفقیت ثبت شد.",
      order: {
        id: order.id,
        code: order.order_code,
        service: service.name,
        network: service.network,
        quantity: order.quantity,
        amount: Number(order.amount),
        status: order.status,
        createdAt: order.created_at
      }
    });

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
        cleanString(
          req.params.code,
          50
        ).toUpperCase();

      if (!/^FC-\d{6}$/.test(code)) {
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
            ) AS amount,
            o.status,
            o.created_at,
            s.name AS service_name,
            s.network,
            s.service_code
          FROM orders o
          LEFT JOIN services s
            ON s.id = o.service_id
          WHERE o.order_code = $1
          LIMIT 1
          `,
          [code]
        );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message:
            "سفارشی با این کد پیدا نشد."
        });
      }

      const order =
        result.rows[0];

      res.json({
        success: true,
        order: {
          id: order.id,
          code: order.order_code,
          service: order.service_name,
          serviceCode: order.service_code,
          network: order.network,
          quantity: order.quantity,
          amount: Number(order.amount),
          status: order.status,
          createdAt: order.created_at
        }
      });

    } catch (error) {

      console.error(
        "Tracking error:",
        error
      );

      res.status(500).json({
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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      "مسیر موردنظر پیدا نشد."
  });
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  try {

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
