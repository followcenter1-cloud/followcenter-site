const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.use(cors({
  origin: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// سرویس‌های معتبر سایت
const SERVICES = {
  Instagram: {
    ig_follow: ["فالوور اینستاگرام", 150000],
    ig_like: ["لایک اینستاگرام", 30000],
    ig_view: ["ویو اینستاگرام", 20000],
    ig_story_view: ["ویو استوری اینستاگرام", 25000],
    ig_comment: ["کامنت اینستاگرام", 80000],
    ig_save: ["سیو پست اینستاگرام", 45000],
    ig_share: ["اشتراک‌گذاری پست اینستاگرام", 40000],
    ig_story_like: ["لایک استوری اینستاگرام", 35000],
    ig_live: ["لایک و بازدید لایو اینستاگرام", 60000],
    ig_explore: ["خدمات اکسپلور اینستاگرام", 70000],
    ig_impression: ["ایمپرشن اینستاگرام", 30000],
    ig_poll: ["رأی نظرسنجی اینستاگرام", 50000]
  },

  Telegram: {
    tg_channel: ["ممبر کانال تلگرام", 180000],
    tg_group: ["ممبر گروه تلگرام", 180000],
    tg_view: ["ویو پست تلگرام", 25000],
    tg_story: ["ویو استوری تلگرام", 30000],
    tg_reaction: ["ری‌اکشن تلگرام", 35000],
    tg_like: ["لایک تلگرام", 35000],
    tg_share: ["اشتراک‌گذاری تلگرام", 30000],
    tg_ads: ["تبلیغات تلگرام", 220000],
    tg_poll: ["رأی نظرسنجی تلگرام", 40000],
    tg_premium: ["ممبر پرمیوم تلگرام", 260000]
  },

  Rubika: {
    rb_follow: ["فالوور روبیکا", 140000],
    rb_like: ["لایک روبیکا", 30000],
    rb_view: ["ویو روبیکا", 20000]
  },

  Eitaa: {
    et_channel: ["ممبر کانال ایتا", 150000],
    et_group: ["ممبر گروه ایتا", 150000],
    et_view: ["ویو ایتا", 20000],
    et_ads: ["تبلیغات ایتا", 250000],
    et_directory: ["ثبت کانال ایتا در دایرکتوری", 80000]
  }
};

function findService(serviceId) {
  for (const [network, services] of Object.entries(SERVICES)) {
    if (services[serviceId]) {
      return {
        id: serviceId,
        network,
        name: services[serviceId][0],
        price: services[serviceId][1]
      };
    }
  }

  return null;
}

function generateOrderCode() {
  return "FC-" + Math.floor(100000 + Math.random() * 900000);
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      network VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      price_per_1000 BIGINT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_code VARCHAR(20) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      service_id INTEGER REFERENCES services(id),
      quantity INTEGER NOT NULL,
      target_url TEXT NOT NULL,
      phone VARCHAR(20) NOT NULL,
      notes TEXT,
      total_price BIGINT NOT NULL,
      status VARCHAR(30) DEFAULT 'در انتظار بررسی',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      amount BIGINT NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      transaction_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_orders_phone
      ON orders(phone);

    CREATE INDEX IF NOT EXISTS idx_orders_status
      ON orders(status);

    CREATE INDEX IF NOT EXISTS idx_orders_created_at
      ON orders(created_at);
  `);

  // ثبت سرویس‌ها در دیتابیس
  for (const [network, services] of Object.entries(SERVICES)) {
    for (const [serviceId, data] of Object.entries(services)) {
      await pool.query(
        `
        INSERT INTO services
          (network, name, price_per_1000)
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
          SELECT 1
          FROM services
          WHERE network = $1 AND name = $2
        )
        `,
        [network, data[0], data[1]]
      );
    }
  }

  console.log("Database initialized successfully");
}

// تست API و دیتابیس
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "FollowCenter API and database are working"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// اطلاعات API
app.get("/api", (req, res) => {
  res.json({
    success: true,
    name: "FollowCenter.ir",
    version: "1.0.0"
  });
});

// دریافت لیست سرویس‌ها
app.get("/api/services", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, network, name, price_per_1000
      FROM services
      WHERE is_active = TRUE
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "خطا در دریافت سرویس‌ها"
    });
  }
});

// ثبت سفارش جدید
app.post("/api/orders", async (req, res) => {
  try {
    const {
      serviceId,
      quantity,
      link,
      phone,
      notes
    } = req.body;

    const cleanPhone = String(phone || "").trim();
    const cleanLink = String(link || "").trim();
    const cleanNotes = String(notes || "").trim();
    const qty = Number(quantity);

    // اعتبارسنجی اولیه
    if (!serviceId || !cleanLink || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات سفارش کامل نیست."
      });
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 10000000) {
      return res.status(400).json({
        success: false,
        message: "تعداد سفارش نامعتبر است."
      });
    }

    if (cleanPhone.length < 8 || cleanPhone.length > 20) {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل نامعتبر است."
      });
    }

    if (cleanLink.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "لینک بیش از حد طولانی است."
      });
    }

    if (cleanNotes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "توضیحات بیش از حد طولانی است."
      });
    }

    // سرویس فقط از لیست معتبر سرور انتخاب می‌شود
    const service = findService(String(serviceId));

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "سرویس انتخاب‌شده معتبر نیست."
      });
    }

    // قیمت در سرور محاسبه می‌شود
    const totalPrice = Math.round(
      service.price * qty / 1000
    );

    // ساخت یا دریافت کاربر
    const userResult = await pool.query(
      `
      INSERT INTO users (phone)
      VALUES ($1)
      ON CONFLICT (phone)
      DO UPDATE SET phone = EXCLUDED.phone
      RETURNING id
      `,
      [cleanPhone]
    );

    const userId = userResult.rows[0].id;

    // پیدا کردن سرویس دیتابیس
    const serviceResult = await pool.query(
      `
      SELECT id
      FROM services
      WHERE network = $1 AND name = $2
      LIMIT 1
      `,
      [service.network, service.name]
    );

    if (!serviceResult.rows.length) {
      return res.status(500).json({
        success: false,
        message: "سرویس در دیتابیس پیدا نشد."
      });
    }

    const dbServiceId = serviceResult.rows[0].id;

    // تولید کد سفارش
    let orderCode;
    let inserted = false;
    let orderResult;

    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      orderCode = generateOrderCode();

      try {
        orderResult = await pool.query(
          `
          INSERT INTO orders
          (
            order_code,
            user_id,
            service_id,
            quantity,
            target_url,
            phone,
            notes,
            total_price,
            status
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING
            id,
            order_code,
            total_price,
            status,
            created_at
          `,
          [
            orderCode,
            userId,
            dbServiceId,
            qty,
            cleanLink,
            cleanPhone,
            cleanNotes || null,
            totalPrice,
            "در انتظار بررسی"
          ]
        );

        inserted = true;
      } catch (error) {
        if (error.code !== "23505") {
          throw error;
        }
      }
    }

    if (!inserted) {
      return res.status(500).json({
        success: false,
        message: "امکان ساخت کد سفارش وجود نداشت."
      });
    }

    res.status(201).json({
      success: true,
      message: "سفارش با موفقیت ثبت شد.",
      order: {
        code: orderResult.rows[0].order_code,
        amount: Number(orderResult.rows[0].total_price),
        status: orderResult.rows[0].status,
        createdAt: orderResult.rows[0].created_at
      }
    });

  } catch (error) {
    console.error("Order error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در ثبت سفارش."
    });
  }
});

// پیگیری سفارش
app.get("/api/orders/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "")
      .trim()
      .toUpperCase();

    if (!/^FC-\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "کد سفارش نامعتبر است."
      });
    }

    const result = await pool.query(
      `
      SELECT
        o.order_code,
        s.network,
        s.name AS service,
        o.quantity,
        o.total_price,
        o.status,
        o.created_at
      FROM orders o
      JOIN services s ON s.id = o.service_id
      WHERE o.order_code = $1
      LIMIT 1
      `,
      [code]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "سفارشی با این کد پیدا نشد."
      });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      order: {
        code: order.order_code,
        network: order.network,
        service: order.service,
        quantity: order.quantity,
        amount: Number(order.total_price),
        status: order.status,
        date: order.created_at
      }
    });

  } catch (error) {
    console.error("Tracking error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در پیگیری سفارش."
    });
  }
});

// مسیر ناشناخته
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "مسیر مورد نظر پیدا نشد"
  });
});

// خطای داخلی
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "خطای داخلی سرور"
  });
});

// شروع سرور
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`FollowCenter API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

startServer();
