const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

// اتصال به PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// امنیت پایه
app.use(helmet());

// دریافت JSON
app.use(express.json({ limit: "100kb" }));

// CORS
app.use(cors({
  origin: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// محدودیت درخواست‌ها
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// ساخت جدول‌های دیتابیس
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

  console.log("Database initialized successfully");
}

// تست سلامت سرور
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

// راه‌اندازی سرور
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
