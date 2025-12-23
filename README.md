# 🛍️ Moramor - بک‌اند فروشگاه اکسسوری

بک‌اند کامل و حرفه‌ای برای فروشگاه اینترنتی اکسسوری با **NestJS**، **Prisma** و **PostgreSQL**.

[![CI/CD](https://github.com/your-username/moramor-core/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/moramor-core/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 فهرست مطالب

- [ویژگی‌ها](#-ویژگی‌ها)
- [تکنولوژی‌ها](#️-تکنولوژی‌ها)
- [پیش‌نیازها](#-پیش‌نیازها)
- [نصب و راه‌اندازی](#-نصب-و-راه‌اندازی)
- [استفاده](#-استفاده)
- [مستندات API](#-مستندات-api)
- [تست](#-تست)
- [استقرار](#-استقرار)
- [معماری](#-معماری)
- [مشارکت](#-مشارکت)

## ✨ ویژگی‌ها

### احراز هویت و مجوزدهی
- ✅ ثبت‌نام و ورود با JWT
- ✅ Refresh Token برای امنیت بیشتر
- ✅ ورود با Google OAuth 2.0
- ✅ نقش‌های کاربری (User, Admin, Super Admin)
- ✅ محافظت از مسیرها با Guards

### مدیریت محصولات
- ✅ CRUD کامل محصولات
- ✅ دسته‌بندی محصولات (با قابلیت سلسله‌مراتبی)
- ✅ جستجوی پیشرفته و فیلترینگ
- ✅ Pagination برای لیست‌ها
- ✅ مدیریت موجودی انبار
- ✅ محصولات ویژه

### سبد خرید و سفارشات
- ✅ سبد خرید کامل
- ✅ مدیریت سفارشات
- ✅ وضعیت‌های مختلف سفارش (در انتظار، تایید شده، ارسال شده، تحویل داده شده)
- ✅ کد پیگیری مرسوله
- ✅ تاریخچه سفارشات

### پرداخت
- ✅ درگاه زرین‌پال (ZarinPal)
- ✅ پرداخت در محل (Cash on Delivery)
- ✅ واریز بانکی
- ✅ تایید خودکار پرداخت

### امکانات جانبی
- ✅ آدرس‌های کاربر (چندتایی)
- ✅ لیست علاقه‌مندی‌ها (Wishlist)
- ✅ نظرات و امتیازدهی محصولات
- ✅ آپلود تصویر (با پردازش و بهینه‌سازی)
- ✅ یکپارچه‌سازی S3/MinIO

### امنیت و کارایی
- ✅ Rate Limiting
- ✅ Validation با class-validator
- ✅ Helmet برای امنیت headers
- ✅ CORS
- ✅ Hash رمزعبور با bcrypt
- ✅ HttpOnly Cookies

### توسعه و استقرار
- ✅ Docker و Docker Compose
- ✅ CI/CD با GitHub Actions
- ✅ Nginx به عنوان Reverse Proxy
- ✅ Health Check endpoint
- ✅ مستندات Swagger/OpenAPI
- ✅ تست‌های Unit و Integration

## 🛠️ تکنولوژی‌ها

- **Runtime:** Node.js 18+
- **Framework:** NestJS 10
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5
- **Authentication:** JWT + Passport
- **Storage:** AWS S3 / MinIO
- **Cache:** Redis
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Web Server:** Nginx

## 📦 پیش‌نیازها

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker & Docker Compose (اختیاری)

## 🚀 نصب و راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone https://github.com/your-username/moramor-core.git
cd moramor-core
```

### 2. نصب dependencies

```bash
npm install
```

### 3. تنظیم environment variables

```bash
cp env.template .env
```

فایل `.env` را ویرایش کرده و مقادیر را تنظیم کنید:

```env
# Database
DATABASE_URL="postgresql://moramor:moramor123@localhost:5432/moramor_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# ZarinPal
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=moramor-products
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

### 4. راه‌اندازی با Docker (پیشنهادی)

```bash
# شروع سرویس‌ها (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.dev.yml up -d

# اجرای migrations
npx prisma migrate dev

# Seed کردن دیتابیس
npm run prisma:seed

# اجرای برنامه
npm run start:dev
```

### 5. راه‌اندازی بدون Docker

```bash
# نصب PostgreSQL, Redis و MinIO به صورت محلی
# سپس:

# اجرای migrations
npx prisma migrate dev

# Seed کردن دیتابیس
npm run prisma:seed

# اجرای برنامه
npm run start:dev
```

## 💻 استفاده

پس از راه‌اندازی، برنامه در آدرس زیر در دسترس است:

- **API:** http://localhost:3000/api/v1
- **API Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health

### دسترسی اولیه

کاربر پیش‌فرض ادمین:
- **Email:** admin@moramor.com
- **Password:** Admin@123456

### اسکریپت‌های مفید

```bash
# Development
npm run start:dev        # اجرا با watch mode
npm run start:debug      # اجرا با debug mode

# Build
npm run build            # Build برای production
npm run start:prod       # اجرای build شده

# Database
npm run prisma:generate  # تولید Prisma Client
npm run prisma:migrate   # اجرای migrations
npm run prisma:seed      # Seed کردن دیتا

# Testing
npm run test             # اجرای تست‌های unit
npm run test:watch       # اجرا با watch mode
npm run test:cov         # تست با coverage
npm run test:e2e         # اجرای تست‌های e2e

# Linting & Formatting
npm run lint             # بررسی کد
npm run format           # فرمت کردن کد
```

## 📚 مستندات API

مستندات کامل API در Swagger موجود است:

```
http://localhost:3000/api-docs
```

### نمونه‌هایی از Endpoints:

#### Authentication
```http
POST   /api/v1/auth/register      # ثبت‌نام
POST   /api/v1/auth/login          # ورود
POST   /api/v1/auth/refresh        # تمدید توکن
GET    /api/v1/auth/me             # پروفایل کاربر
POST   /api/v1/auth/logout         # خروج
```

#### Products
```http
GET    /api/v1/products                        # لیست محصولات
GET    /api/v1/products/:id                    # جزئیات محصول
GET    /api/v1/products/slug/:slug             # محصول بر اساس slug
POST   /api/v1/products                        # ایجاد محصول (Admin)
PATCH  /api/v1/products/:id                    # ویرایش محصول (Admin)
DELETE /api/v1/products/:id                    # حذف محصول (Admin)
```

#### Cart
```http
GET    /api/v1/cart                # سبد خرید
POST   /api/v1/cart                # افزودن به سبد
PUT    /api/v1/cart/:itemId        # ویرایش آیتم
DELETE /api/v1/cart/:itemId        # حذف از سبد
DELETE /api/v1/cart                # خالی کردن سبد
```

#### Orders
```http
GET    /api/v1/orders              # سفارشات کاربر
GET    /api/v1/orders/:id          # جزئیات سفارش
DELETE /api/v1/orders/:id          # لغو سفارش
```

#### Checkout
```http
POST   /api/v1/checkout            # شروع پرداخت
GET    /api/v1/checkout/verify     # تایید پرداخت (callback)
```

برای جزئیات بیشتر به مستندات Swagger مراجعه کنید.

## 🧪 تست

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

نتایج coverage در پوشه `coverage/` قابل مشاهده است.

## 🚢 استقرار

### استقرار با Docker Compose

```bash
# Build و اجرا
docker-compose up -d

# مشاهده logs
docker-compose logs -f app

# توقف
docker-compose down
```

### استقرار در Production

1. **تنظیم environment variables:**

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=strong-production-secret
# ... سایر تنظیمات
```

2. **Build:**

```bash
npm run build
```

3. **اجرای migrations:**

```bash
npx prisma migrate deploy
```

4. **اجرای برنامه:**

```bash
npm run start:prod
```

### استقرار با Nginx

فایل `nginx.conf` نمونه در پروژه موجود است. برای استفاده:

```bash
# کپی فایل config
sudo cp nginx.conf /etc/nginx/sites-available/moramor

# فعال‌سازی
sudo ln -s /etc/nginx/sites-available/moramor /etc/nginx/sites-enabled/

# تست config
sudo nginx -t

# راه‌اندازی مجدد
sudo systemctl restart nginx
```

### CI/CD با GitHub Actions

پروژه شامل workflow کامل CI/CD است که شامل:

- ✅ Linting و Testing خودکار
- ✅ Build Docker Image
- ✅ Deploy به Staging
- ✅ Deploy به Production

برای فعال‌سازی، Secrets زیر را در GitHub تنظیم کنید:

```
DOCKER_USERNAME
DOCKER_PASSWORD
STAGING_HOST
STAGING_USERNAME
STAGING_SSH_KEY
PRODUCTION_HOST
PRODUCTION_USERNAME
PRODUCTION_SSH_KEY
```

## 🏗️ معماری

### ساختار پروژه

```
moramor-core/
├── prisma/
│   ├── schema.prisma          # Schema دیتابیس
│   ├── migrations/            # Migration files
│   └── seed.ts                # Seed data
├── src/
│   ├── common/                # کدهای مشترک
│   │   ├── decorators/        # Custom decorators
│   │   ├── guards/            # Auth & Role guards
│   │   ├── interfaces/        # TypeScript interfaces
│   │   └── prisma/            # Prisma service
│   ├── modules/               # Feature modules
│   │   ├── auth/              # احراز هویت
│   │   ├── users/             # کاربران
│   │   ├── products/          # محصولات
│   │   ├── categories/        # دسته‌بندی‌ها
│   │   ├── cart/              # سبد خرید
│   │   ├── orders/            # سفارشات
│   │   ├── checkout/          # تسویه‌حساب
│   │   ├── payment/           # پرداخت
│   │   ├── addresses/         # آدرس‌ها
│   │   ├── wishlist/          # علاقه‌مندی‌ها
│   │   ├── reviews/           # نظرات
│   │   └── upload/            # آپلود فایل
│   ├── health/                # Health check
│   ├── app.module.ts          # Root module
│   └── main.ts                # Entry point
├── test/                      # E2E tests
├── docker-compose.yml         # Docker setup
├── Dockerfile                 # Docker image
└── README.md                  # این فایل
```

### Flow کلی سیستم

1. **Authentication:** کاربر ثبت‌نام/ورود → دریافت JWT Token
2. **Browse:** مشاهده محصولات، فیلتر، جستجو
3. **Cart:** افزودن محصول به سبد خرید
4. **Checkout:** انتخاب آدرس و روش پرداخت
5. **Payment:** پرداخت از طریق درگاه (ZarinPal)
6. **Order:** تایید سفارش و کاهش موجودی
7. **Fulfillment:** ادمین ارسال محصول و ثبت کد رهگیری

## 🤝 مشارکت

مشارکت‌ها استقبال می‌شود! لطفاً:

1. Fork کنید
2. یک branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request باز کنید

### قوانین مشارکت

- کد را با ESLint و Prettier فرمت کنید
- تست بنویسید
- مستندات را به‌روز کنید
- Commit message‌های واضح بنویسید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای جزئیات بیشتر به فایل [LICENSE](LICENSE) مراجعه کنید.

## 📞 پشتیبانی

برای سوالات و مشکلات:

- 📧 Email: support@moramor.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/moramor-core/issues)
- 📖 Docs: [مستندات کامل](https://docs.moramor.com)

## 🙏 تشکر

از تمام کسانی که در این پروژه مشارکت کرده‌اند، تشکر می‌کنیم!

---

**ساخته شده با ❤️ توسط تیم Moramor**

