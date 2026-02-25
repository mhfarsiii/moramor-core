# ⚡️ راهنمای شروع سریع

این راهنما به شما کمک می‌کند در کمتر از 5 دقیقه پروژه را راه‌اندازی کنید.

## پیش‌نیازها

فقط نیاز دارید:
- **Docker** و **Docker Compose** نصب باشد
- **Node.js 18+** (برای development)

## گام‌های راه‌اندازی

### 1️⃣ دانلود پروژه

```bash
git clone https://github.com/your-username/moramor-core.git
cd moramor-core
```

### 2️⃣ نصب dependencies

```bash
npm install
```

یا با Make:
```bash
make install
```

### 3️⃣ تنظیم environment

```bash
cp env.template .env
```

**مهم:** فایل `.env` را ویرایش کنید:

```env
# حداقل این مقادیر را تنظیم کنید:
DATABASE_URL="postgresql://moramor:moramor123@localhost:5432/moramor_db?schema=public"
JWT_SECRET=your-very-secret-key-here-change-me
JWT_REFRESH_SECRET=your-refresh-secret-key-here-change-me
```

### 4️⃣ راه‌اندازی سرویس‌ها

```bash
# شروع PostgreSQL, Redis, MinIO
docker-compose -f docker-compose.dev.yml up -d
```

یا با Make:
```bash
make docker-up
```

منتظر بمانید تا سرویس‌ها آماده شوند (حدود 30 ثانیه)

### 5️⃣ تنظیم دیتابیس

```bash
# اجرای migrations
npx prisma migrate dev

# Seed کردن دیتای اولیه
npm run prisma:seed
```

یا با Make:
```bash
make migrate seed
```

### 6️⃣ اجرای برنامه

```bash
npm run start:dev
```

یا با Make:
```bash
make dev
```

## ✅ تست کنید!

برنامه آماده است! این آدرس‌ها را باز کنید:

- 🌐 **API:** http://localhost:3000/api/v1
- 📚 **API Docs:** http://localhost:3000/api-docs
- ❤️ **Health Check:** http://localhost:3000/health
- 💾 **MinIO Console:** http://localhost:9001 (admin/minioadmin)

### ورود با OTP (کاربر پیش‌فرض)

برای تست، می‌توانید با ایمیل زیر و جریان OTP وارد شوید:

```
Email: admin@moramor.com
```

## 🧪 تست API

### 1. ارسال کد OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moramor.com"
  }'
```

### 2. تأیید کد و دریافت توکن

پس از دریافت کد ۶ رقمی (در محیط واقعی از ایمیل، در دیو ممکن است از لاگ/console)، آن را در درخواست زیر استفاده کنید:

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moramor.com",
    "code": "123456"
  }'
```

پاسخ شامل `accessToken` و `refreshToken` است که برای درخواست‌های بعدی نیاز دارید.

### دریافت محصولات

```bash
curl http://localhost:3000/api/v1/products
```

### افزودن محصول (نیاز به توکن ادمین)

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محصول تست",
    "slug": "test-product",
    "price": 100000,
    "categoryId": "CATEGORY_ID_FROM_SEED",
    "stock": 10
  }'
```

## 📱 استفاده با Postman

1. فایل Swagger را از http://localhost:3000/api-docs-json دانلود کنید
2. در Postman: `Import` > `Upload Files`
3. تمام endpointها آماده استفاده هستند!

## 🐛 عیب‌یابی

### خطای اتصال به دیتابیس

```bash
# بررسی وضعیت Docker
docker-compose -f docker-compose.dev.yml ps

# مشاهده logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Port در حال استفاده است

اگر port 3000 اشغال است:

```env
# در .env تغییر دهید:
PORT=3001
```

### MinIO کار نمی‌کند

```bash
# ورود به MinIO Console
# http://localhost:9001
# Username: minioadmin
# Password: minioadmin

# یک bucket با نام "moramor-products" بسازید
```

## 🎯 گام‌های بعدی

حالا که همه چیز کار می‌کند:

1. 📖 [مستندات کامل API](./API_GUIDE.md) را مطالعه کنید
2. 🔍 Swagger Docs را کاوش کنید: http://localhost:3000/api-docs
3. 💻 کد را مطالعه کنید - از `src/modules` شروع کنید
4. 🧪 تست‌ها را اجرا کنید: `npm test`
5. 🚀 فیچر جدید اضافه کنید!

## 🔥 دستورات مفید (با Make)

```bash
make help           # نمایش همه دستورات
make dev            # اجرای development
make test           # اجرای تست‌ها
make docker-up      # شروع Docker services
make docker-down    # توقف Docker services
make migrate        # اجرای migrations
make seed           # Seed کردن دیتا
make logs           # نمایش logs
make clean          # پاک کردن build files
```

## 💡 نکات

- **Hot Reload:** تغییرات کد به صورت خودکار اعمال می‌شود
- **Debugging:** برای debug: `npm run start:debug` و از VS Code debugger استفاده کنید

## ❓ سوالات متداول

**Q: چطور دیتابیس را reset کنم؟**

```bash
make migrate-reset
```

**Q: چطور بکاپ بگیرم؟**

```bash
make backup-db
```

**Q: چطور دیتای جدید seed کنم؟**

فایل `prisma/seed.ts` را ویرایش کنید و:
```bash
make seed
```

---

**مشکلی پیش آمد؟** [Issue باز کنید](https://github.com/your-username/moramor-core/issues)

**موفق باشید! 🎉**

