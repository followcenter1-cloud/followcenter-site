const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();

const PORT = process.env.PORT || 10000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not configured.');
  process.exit(1);
}

/* =========================================================
   SECURITY
========================================================= */

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: [
      'https://followcenter.ir',
      'https://www.followcenter.ir'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false
  })
);

app.use(
  express.json({
    limit: '50kb'
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.'
  }
});

app.use('/api/', apiLimiter);

/* =========================================================
   DATABASE
========================================================= */

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

/* =========================================================
   SERVICES
========================================================= */

const SERVICES = [
  // Instagram
  {
    code: 'ig_follow',
    network: 'instagram',
    name: 'فالوور اینستاگرام',
    price: 150000
  },
  {
    code: 'ig_like',
    network: 'instagram',
    name: 'لایک اینستاگرام',
    price: 30000
  },
  {
    code: 'ig_view',
    network: 'instagram',
    name: 'ویو اینستاگرام',
    price: 20000
  },
  {
    code: 'ig_story_view',
    network: 'instagram',
    name: 'ویو استوری اینستاگرام',
    price: 25000
  },
  {
    code: 'ig_comment',
    network: 'instagram',
    name: 'کامنت اینستاگرام',
    price: 80000
  },
  {
    code: 'ig_save',
    network: 'instagram',
    name: 'سیو اینستاگرام',
    price: 45000
  },
  {
    code: 'ig_share',
    network: 'instagram',
    name: 'اشتراک‌گذاری اینستاگرام',
    price: 45000
  },
  {
    code: 'ig_story_like',
    network: 'instagram',
    name: 'لایک استوری اینستاگرام',
    price: 35000
  },
  {
    code: 'ig_live',
    network: 'instagram',
    name: 'بازدید لایو اینستاگرام',
    price: 60000
  },
  {
    code: 'ig_explore',
    network: 'instagram',
    name: 'اکسپلور اینستاگرام',
    price: 70000
  },
  {
    code: 'ig_impression',
    network: 'instagram',
    name: 'ایمپرشن اینستاگرام',
    price: 30000
  },
  {
    code: 'ig_poll',
    network: 'instagram',
    name: 'تعامل نظرسنجی اینستاگرام',
    price: 50000
  },

  // Telegram
  {
    code: 'tg_channel',
    network: 'telegram',
    name: 'عضو کانال تلگرام',
    price: 180000
  },
  {
    code: 'tg_group',
    network: 'telegram',
    name: 'عضو گروه تلگرام',
    price: 180000
  },
  {
    code: 'tg_view',
    network: 'telegram',
    name: 'ویو تلگرام',
    price: 25000
  },
  {
    code: 'tg_story',
    network: 'telegram',
    name: 'ویو استوری تلگرام',
    price: 30000
  },
  {
    code: 'tg_reaction',
    network: 'telegram',
    name: 'ری‌اکشن تلگرام',
    price: 35000
  },
  {
    code: 'tg_like',
    network: 'telegram',
    name: 'لایک تلگرام',
    price: 35000
  },
  {
    code: 'tg_share',
    network: 'telegram',
    name: 'اشتراک‌گذاری تلگرام',
    price: 30000
  },
  {
    code: 'tg_ads',
    network: 'telegram',
    name: 'تبلیغات تلگرام',
    price: 220000
  },
  {
    code: 'tg_poll',
    network: 'telegram',
    name: 'نظرسنجی تلگرام',
    price: 40000
  },
  {
    code: 'tg_premium',
    network: 'telegram',
    name: 'عضو پریمیوم تلگرام',
    price: 260000
  },

  // Rubika
  {
    code: 'rb_follow',
    network: 'rubika',
    name: 'فالوور روبیکا',
    price: 140000
  },
  {
    code: 'rb_like',
    network: 'rubika',
    name: 'لایک روبیکا',
    price: 30000
  },
  {
    code: 'rb_view',
    network: 'rubika',
    name: 'ویو روبیکا',
    price: 20000
  },

  // Eitaa
  {
    code: 'ea_channel',
    network: 'eitaa',
    name: 'عضو کانال ایتا',
    price: 150000
  },
  {
    code: 'ea_group',
    network: 'eitaa',
    name: 'عضو گروه ایتا',
    price: 150000
  },
  {
    code: 'ea_view',
    network: 'eitaa',
    name: 'ویو ایتا',
    price: 20000
  },
  {
    code: 'ea_ads',
    network: 'eitaa',
    name: 'تبلیغات ایتا',
    price: 250000
  },
  {
    code: 'ea_directory',
    network: 'eitaa',
    name: 'ثبت در فهرست ایتا',
    price: 80000
  }
];

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value, maxLength = 2000) {
  if (value === undefined || value === null) return '';

  return String(value)
    .trim()
    .slice(0, maxLength);
}

function cleanPhone(value) {
  return cleanString(value, 30).replace(/[^\d+]/g, '');
}

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

function isValidQuantity(value) {
  const number = Number(value);

  return (
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 100000000
  );
}

function generateOrderCode() {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `FC-${number}`;
}

async function generateUniqueOrderCode() {
  for (let i = 0; i < 10; i++) {
    const code = generateOrderCode();

    const result = await pool.query(
      'SELECT id FROM orders WHERE order_code = $1 LIMIT 1',
      [code]
    );

    if (result.rowCount === 0) {
      return code;
    }
  }

  throw new Error('Could not generate unique order code.');
}

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /* USERS */

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(30) UNIQUE,
        email VARCHAR(255),
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* SERVICES */

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_code VARCHAR(100) UNIQUE NOT NULL,
        network VARCHAR(50) NOT NULL,
        name TEXT NOT NULL,
        price NUMERIC(14,2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* Compatibility with older database versions */

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
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `);

    await client.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    /* ORDERS */

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_code VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER,
        service_id INTEGER,
        quantity INTEGER NOT NULL,
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

    /* Compatibility with old orders table */

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS order_code VARCHAR(50)
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS user_id INTEGER
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS service_id INTEGER
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS quantity INTEGER
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS link TEXT
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS target_url TEXT
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS phone VARCHAR(30)
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2)
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS total_price NUMERIC(14,2)
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS status VARCHAR(50)
    `);

    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    /* Fix old records / compatibility */

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

    /* SEED / UPDATE SERVICES */

    for (const service of SERVICES) {
      await client.query(
        `
        INSERT INTO services (
          service_code,
          network,
          name,
          price,
          is_active,
          updated_at
        )
        VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP)
        ON CONFLICT (service_code)
        DO UPDATE SET
          network = EXCLUDED.network,
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          is_active = TRUE,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          service.code,
          service.network,
          service.name,
          service.price
        ]
      );
    }

    await client.query('COMMIT');

    console.log('Database initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Database initialization failed:', error);

    throw error;
  } finally {
    client.release();
  }
}

/* =========================================================
   BASIC ROUTES
========================================================= */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FollowCenter API is running.',
    status: 'online'
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FollowCenter API and database are working.',
    status: 'online'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'unavailable'
    });
  }
});

/* =========================================================
   SERVICES API
========================================================= */

app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        service_code,
        network,
        name,
        price,
        is_active
      FROM services
      WHERE is_active = TRUE
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('Services error:', error);

    res.status(500).json({
      success: false,
      message: 'خطا در دریافت سرویس‌ها.'
    });
  }
});

/* =========================================================
   CREATE ORDER
   بدون نیاز به درگاه پرداخت
========================================================= */

app.post('/api/orders', async (req, res) => {
  try {
    const serviceId = Number(req.body.serviceId);
    const quantity = Number(req.body.quantity);

    const link = cleanString(req.body.link, 2000);
    const phone = cleanPhone(req.body.phone);
    const notes = cleanString(req.body.notes, 1000);

    /* Validation */

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'سرویس انتخاب‌شده معتبر نیست.'
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'تعداد سفارش معتبر نیست.'
      });
    }

    if (!link || !isValidUrl(link)) {
      return res.status(400).json({
        success: false,
        message: 'لینک واردشده معتبر نیست.'
      });
    }

    if (!phone || phone.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'شماره تماس معتبر نیست.'
      });
    }

    /* Get service */

    const serviceResult = await pool.query(
      `
      SELECT
        id,
        service_code,
        network,
        name,
        price
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
        message: 'سرویس پیدا نشد یا غیرفعال است.'
      });
    }

    const service = serviceResult.rows[0];

    /* Calculate price on server */

    const unitPrice = Number(service.price);
    const totalPrice = Math.round(
      (unitPrice * quantity) / 1000
    );

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'قیمت سفارش معتبر نیست.'
      });
    }

    const orderCode = await generateUniqueOrderCode();

    /*
      فعلاً user_id نداریم چون سیستم حساب کاربری هنوز ساخته نشده.
      بعداً با سیستم ورود، user_id واقعی اینجا قرار می‌گیرد.
    */

    const userId = null;

    /* Insert order */

    const insertResult = await pool.query(
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
        $2,
        $3,
        $4,
        $5,
        $5,
        $6,
        $7,
        $8,
        $8,
        $9
      )
      RETURNING
        id,
        order_code,
        service_id,
        quantity,
        link,
        phone,
        notes,
        amount,
        total_price,
        status,
        created_at
      `,
      [
        orderCode,
        userId,
        service.id,
        quantity,
        link,
        phone,
        notes || null,
        totalPrice,
        'pending'
      ]
    );

    const order = insertResult.rows[0];

    console.log(
      `Order created successfully: ${order.order_code}`
    );

    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد.',
      order: {
        code: order.order_code,
        service: service.name,
        quantity: order.quantity,
        amount: Number(order.amount),
        status: order.status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);

    res.status(500).json({
      success: false,
      message: 'ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید.'
    });
  }
});

/* =========================================================
   TRACK ORDER
========================================================= */

app.get('/api/orders/:code', async (req, res) => {
  try {
    const code = cleanString(req.params.code, 50).toUpperCase();

    if (!/^FC-\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'کد سفارش معتبر نیست.'
      });
    }

    const result = await pool.query(
      `
      SELECT
        o.order_code,
        o.quantity,
        o.amount,
        o.total_price,
        o.status,
        o.created_at,
        s.name AS service_name,
        s.network
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
        message: 'سفارشی با این کد پیدا نشد.'
      });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      order: {
        code: order.order_code,
        service: order.service_name,
        network: order.network,
        quantity: order.quantity,
        amount:
          order.amount !== null
            ? Number(order.amount)
            : Number(order.total_price || 0),
        status: order.status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Tracking error:', error);

    res.status(500).json({
      success: false,
      message: 'خطا در پیگیری سفارش.'
    });
  }
});

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر موردنظر پیدا نشد.'
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: 'خطای داخلی سرور.'
  });
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `FollowCenter API running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      'Server could not start because database initialization failed.'
    );

    process.exit(1);
  }
}

startServer();
