const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});


/* =========================
   SERVICES
========================= */

const SERVICES = {
  Instagram: [
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
  ],

  Telegram: [
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
  ],

  Rubika: [
    ['rb_follow', 'فالوور روبیکا', 140000],
    ['rb_like', 'لایک روبیکا', 30000],
    ['rb_view', 'ویو روبیکا', 20000]
  ],

  Eitaa: [
    ['et_channel', 'ممبر کانال ایتا', 150000],
    ['et_group', 'ممبر گروه ایتا', 150000],
    ['et_view', 'ویو ایتا', 20000],
    ['et_ads', 'تبلیغات ایتا', 250000],
    ['et_directory', 'ثبت کانال ایتا در دایرکتوری', 80000]
  ]
};


function findService(serviceId) {
  for (const [network, items] of Object.entries(SERVICES)) {
    for (const [id, name, price] of items) {
      if (id === String(serviceId)) {
        return {
          id,
          network,
          name,
          price
        };
      }
    }
  }

  return null;
}


/* =========================
   VALIDATION
========================= */

function validServiceId(id) {
  return /^[a-z0-9_]{2,50}$/i.test(String(id || ''));
}

function validQuantity(quantity) {
  const q = Number(quantity);

  return Number.isInteger(q) &&
    q >= 1 &&
    q <= 10000000;
}

function validPhone(phone) {
  return /^(\+98|0098|98|0)?9\d{9}$/.test(
    String(phone || '').replace(/[\s-]/g, '')
  );
}

function validUrl(url) {
  return typeof url === 'string' &&
    url.trim().length >= 3 &&
    url.trim().length <= 2000;
}


/* =========================
   DATABASE INITIALIZATION
========================= */

async function initializeDatabase() {

  /* USERS */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(30) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  /* SERVICES */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY
    )
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS service_code VARCHAR(100)
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS network VARCHAR(50)
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS name VARCHAR(255)
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS price_per_1000 NUMERIC(14,2)
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE
  `);

  await pool.query(`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await pool.query(`
    UPDATE services
    SET active = TRUE
    WHERE active IS NULL
  `);


  /* ORDERS */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_code VARCHAR(30) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      service_id INTEGER REFERENCES services(id),
      quantity INTEGER NOT NULL,
      link TEXT,
      target_url TEXT,
      phone VARCHAR(30) NOT NULL,
      notes TEXT,
      amount NUMERIC(14,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS user_id INTEGER
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS service_id INTEGER
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS quantity INTEGER
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS link TEXT
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS target_url TEXT
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30)
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS notes TEXT
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2)
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending'
  `);

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);


  /*
   * سازگاری با دیتابیس قدیمی
   * اگر target_url برای سفارش‌های قدیمی خالی باشد،
   * از link مقدار می‌گیرد.
   */

  await pool.query(`
    UPDATE orders
    SET target_url = link
    WHERE target_url IS NULL
      AND link IS NOT NULL
  `);


  /* PAYMENTS */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      amount NUMERIC(14,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      transaction_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  /* AUDIT LOGS */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  /* SEED SERVICES */

  for (const [network, items] of Object.entries(SERVICES)) {

    for (const [serviceCode, name, price] of items) {

      const existing = await pool.query(
        `
        SELECT id
        FROM services
        WHERE service_code = $1
        LIMIT 1
        `,
        [serviceCode]
      );

      if (existing.rows.length) {

        await pool.query(
          `
          UPDATE services
          SET
            network = $1,
            name = $2,
            price_per_1000 = $3,
            active = TRUE
          WHERE service_code = $4
          `,
          [
            network,
            name,
            price,
            serviceCode
          ]
        );

      } else {

        await pool.query(
          `
          INSERT INTO services
            (
              service_code,
              network,
              name,
              price_per_1000,
              active
            )
          VALUES
            (
              $1,
              $2,
              $3,
              $4,
              TRUE
            )
          `,
          [
            serviceCode,
            network,
            name,
            price
          ]
        );

      }
    }
  }

  console.log('Database initialized successfully.');
}


/* =========================
   HOME
========================= */

app.get('/', (req, res) => {

  res.json({
    success: true,
    message: 'FollowCenter API is running'
  });

});


/* =========================
   API
========================= */

app.get('/api', (req, res) => {

  res.json({
    success: true,
    message: 'FollowCenter API is running'
  });

});


/* =========================
   HEALTH
========================= */

app.get('/api/health', async (req, res) => {

  try {

    await pool.query('SELECT 1');

    res.json({
      success: true,
      message: 'FollowCenter API and database are working'
    });

  } catch (error) {

    console.error(
      'Health check failed:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });

  }

});


/* =========================
   SERVICES API
========================= */

app.get('/api/services', async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        service_code,
        network,
        name,
        price_per_1000,
        active
      FROM services
      WHERE active = TRUE
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      services: result.rows
    });

  } catch (error) {

    console.error(
      'Services error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'خطا در دریافت سرویس‌ها'
    });

  }

});


/* =========================
   CREATE ORDER
========================= */

app.post('/api/orders', async (req, res) => {

  const {
    serviceId,
    quantity,
    link,
    phone,
    notes
  } = req.body || {};


  /* VALIDATION */

  if (!validServiceId(serviceId)) {

    return res.status(400).json({
      success: false,
      message: 'سرویس انتخاب‌شده معتبر نیست.'
    });

  }


  if (!validQuantity(quantity)) {

    return res.status(400).json({
      success: false,
      message: 'تعداد واردشده معتبر نیست.'
    });

  }


  if (!validUrl(link)) {

    return res.status(400).json({
      success: false,
      message: 'لینک واردشده معتبر نیست.'
    });

  }


  const cleanPhone =
    String(phone || '').trim();


  if (!validPhone(cleanPhone)) {

    return res.status(400).json({
      success: false,
      message: 'شماره موبایل معتبر نیست.'
    });

  }


  if (String(notes || '').length > 2000) {

    return res.status(400).json({
      success: false,
      message: 'توضیحات بیش از حد طولانی است.'
    });

  }


  const service =
    findService(serviceId);


  if (!service) {

    return res.status(404).json({
      success: false,
      message: 'سرویس پیدا نشد.'
    });

  }


  const amount =
    service.price *
    Number(quantity) /
    1000;


  const client =
    await pool.connect();


  try {

    await client.query('BEGIN');


    /* USER */

    const userResult =
      await client.query(
        `
        INSERT INTO users (phone)
        VALUES ($1)
        ON CONFLICT (phone)
        DO UPDATE SET phone = EXCLUDED.phone
        RETURNING id
        `,
        [cleanPhone]
      );


    const userId =
      userResult.rows[0].id;


    /* SERVICE */

    const serviceResult =
      await client.query(
        `
        SELECT id
        FROM services
        WHERE service_code = $1
          AND active = TRUE
        LIMIT 1
        `,
        [service.id]
      );


    if (!serviceResult.rows.length) {
      throw new Error(
        'SERVICE_NOT_FOUND'
      );
    }


    const serviceDbId =
      serviceResult.rows[0].id;


    /* ORDER CODE */

    let orderCode = null;


    for (let i = 0; i < 10; i++) {

      const candidate =
        'FC-' +
        Math.floor(
          100000 +
          Math.random() * 900000
        );


      const exists =
        await client.query(
          `
          SELECT id
          FROM orders
          WHERE order_code = $1
          LIMIT 1
          `,
          [candidate]
        );


      if (!exists.rows.length) {

        orderCode =
          candidate;

        break;

      }

    }


    if (!orderCode) {

      throw new Error(
        'ORDER_CODE_FAILED'
      );

    }


    /* INSERT ORDER */

    const orderResult =
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
          $9
        )
        RETURNING
          order_code,
          amount,
          status,
          created_at
        `,
        [
          orderCode,
          userId,
          serviceDbId,
          Number(quantity),
          String(link).trim(),
          cleanPhone,
          notes
            ? String(notes).trim()
            : null,
          amount,
          'pending'
        ]
      );


    await client.query(
      'COMMIT'
    );


    res.status(201).json({

      success: true,

      message:
        'سفارش با موفقیت ثبت شد.',

      order: {

        code:
          orderResult.rows[0]
            .order_code,

        amount:
          Number(
            orderResult.rows[0]
              .amount
          ),

        status:
          orderResult.rows[0]
            .status,

        date:
          orderResult.rows[0]
            .created_at

      }

    });


  } catch (error) {

    await client.query(
      'ROLLBACK'
    );

    console.error(
      'Create order error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'خطا در ثبت سفارش.'
    });

  } finally {

    client.release();

  }

});


/* =========================
   TRACK ORDER
========================= */

app.get('/api/orders/:code', async (req, res) => {

  const code =
    String(
      req.params.code || ''
    )
      .trim()
      .toUpperCase();


  if (!/^FC-\d{6}$/.test(code)) {

    return res.status(400).json({
      success: false,
      message: 'کد پیگیری معتبر نیست.'
    });

  }


  try {

    const result =
      await pool.query(
        `
        SELECT
          o.order_code,
          s.network,
          s.name AS service,
          o.quantity,
          o.amount,
          o.status,
          o.created_at
        FROM orders o
        JOIN services s
          ON s.id = o.service_id
        WHERE o.order_code = $1
        LIMIT 1
        `,
        [code]
      );


    if (!result.rows.length) {

      return res.status(404).json({
        success: false,
        message:
          'سفارشی با این کد پیدا نشد.'
      });

    }


    const order =
      result.rows[0];


    res.json({

      success: true,

      order: {

        code:
          order.order_code,

        network:
          order.network,

        service:
          order.service,

        quantity:
          order.quantity,

        amount:
          Number(order.amount),

        status:
          order.status,

        date:
          order.created_at

      }

    });


  } catch (error) {

    console.error(
      'Tracking error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'خطا در پیگیری سفارش.'
    });

  }

});


/* =========================
   404
========================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message:
      'مسیر موردنظر پیدا نشد.'
  });

});


/* =========================
   ERROR HANDLER
========================= */

app.use(
  (error, req, res, next) => {

    console.error(
      'Unhandled error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'خطای داخلی سرور.'
    });

  }
);


/* =========================
   START SERVER
========================= */

async function startServer() {

  try {

    await initializeDatabase();

    app.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log(
          `FollowCenter API running on port ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      'Database initialization failed:',
      error
    );

    process.exit(1);

  }

}


startServer();
