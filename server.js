const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 10000;

// امنیت پایه
app.use(helmet());

// اجازه دریافت JSON
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

// تست سلامت سرور
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FollowCenter API is running"
  });
});

// صفحه اصلی API
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

app.listen(PORT, () => {
  console.log(`FollowCenter API running on port ${PORT}`);
});
