# 📋 فهرست کامل API های Moramor

## Base URL

```
https://api.moramor.shop/api/v1
```

## احراز هویت

تمام endpointهای محافظت‌شده نیاز به Bearer Token دارند:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🔐 احراز هویت (Auth)

> **روش ورود کاربران فروشگاه:** فقط از طریق **OTP ایمیل** (`/auth/send-code` و `/auth/verify-code`).  
> **پنل ادمین:** علاوه بر OTP می‌تواند از **ایمیل/پسورد** (`/auth/login`) و فراموشی رمز عبور استفاده کند.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/send-code` | ❌ | ارسال کد تأیید ۶ رقمی به ایمیل برای ورود/ثبت‌نام |
| POST | `/auth/verify-code` | ❌ | تأیید کد OTP و دریافت accessToken و refreshToken |
| POST | `/auth/login` | ❌ | ورود با ایمیل/پسورد (مخصوص پنل ادمین) |
| POST | `/auth/forgot-password` | ❌ | درخواست بازیابی رمز عبور (برای حساب‌های دارای پسورد) |
| POST | `/auth/reset-password` | ❌ | تغییر رمز عبور با توکن بازیابی |
| POST | `/auth/refresh` | ❌ | تمدید توکن با Refresh Token |
| POST | `/auth/logout` | ✅ | خروج از حساب کاربری |
| GET | `/auth/me` | ✅ | دریافت اطلاعات کاربر جاری |

---

## 👤 کاربران (Users)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/users/profile` | ✅ | ❌ | دریافت پروفایل کاربر جاری |
| PUT | `/users/profile` | ✅ | ❌ | ویرایش پروفایل کاربر جاری |
| GET | `/users` | ✅ | ✅ | دریافت لیست کاربران |
| GET | `/users/:id` | ✅ | ✅ | دریافت اطلاعات یک کاربر |

---

## 📦 محصولات (Products)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/products` | ❌ | ❌ | لیست محصولات (با فیلتر و جستجو) |
| GET | `/products/:id` | ❌ | ❌ | جزئیات محصول بر اساس ID |
| GET | `/products/slug/:slug` | ❌ | ❌ | جزئیات محصول بر اساس slug |
| POST | `/products` | ✅ | ✅ | ایجاد محصول جدید |
| PATCH | `/products/:id` | ✅ | ✅ | ویرایش محصول |
| DELETE | `/products/:id` | ✅ | ✅ | حذف محصول |

**Query Parameters برای GET /products:**
- `page` (number): شماره صفحه (پیش‌فرض: 1)
- `limit` (number): تعداد در صفحه (پیش‌فرض: 16)
- `q` (string): جستجو در نام و توضیحات
- `category` (string): فیلتر بر اساس slug دسته‌بندی
- `min` (number): حداقل قیمت
- `max` (number): حداکثر قیمت
- `sort` (string): مرتب‌سازی (`price-asc`, `price-desc`, `newest`, `oldest`)
- `featured` (boolean): فقط محصولات ویژه

---

## 📁 دسته‌بندی‌ها (Categories)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/categories` | ❌ | ❌ | لیست دسته‌بندی‌ها |
| GET | `/categories/:id` | ❌ | ❌ | جزئیات دسته‌بندی بر اساس ID |
| GET | `/categories/slug/:slug` | ❌ | ❌ | جزئیات دسته‌بندی بر اساس slug |
| POST | `/categories` | ✅ | ✅ | ایجاد دسته‌بندی جدید |
| PATCH | `/categories/:id` | ✅ | ✅ | ویرایش دسته‌بندی |
| DELETE | `/categories/:id` | ✅ | ✅ | حذف دسته‌بندی |

**Query Parameters برای GET /categories:**
- `includeInactive` (boolean): شامل دسته‌بندی‌های غیرفعال

---

## 🛒 سبد خرید (Cart)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | ✅ | دریافت سبد خرید کاربر |
| POST | `/cart` | ✅ | افزودن محصول به سبد خرید |
| PUT | `/cart/:itemId` | ✅ | ویرایش تعداد محصول در سبد |
| DELETE | `/cart/:itemId` | ✅ | حذف محصول از سبد |
| DELETE | `/cart` | ✅ | خالی کردن سبد خرید |

---

## 📍 آدرس‌ها (Addresses)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/addresses` | ✅ | لیست آدرس‌های کاربر |
| GET | `/addresses/:id` | ✅ | جزئیات یک آدرس |
| POST | `/addresses` | ✅ | ایجاد آدرس جدید |
| PATCH | `/addresses/:id` | ✅ | ویرایش آدرس |
| DELETE | `/addresses/:id` | ✅ | حذف آدرس |

---

## 💳 تسویه‌حساب و پرداخت (Checkout)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/checkout` | ✅ | شروع فرآیند خرید و پرداخت |
| GET | `/checkout/verify` | ❌ | تایید پرداخت (callback از درگاه) |

**روش‌های پرداخت:**
- `ZARINPAL`: درگاه زرین‌پال
- `NEXTPAY`: درگاه نکست‌پی
- `CASH_ON_DELIVERY`: پرداخت در محل
- `BANK_TRANSFER`: واریز بانکی

---

## 📦 سفارشات (Orders)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/orders` | ✅ | ❌ | لیست سفارشات کاربر |
| GET | `/orders/admin` | ✅ | ✅ | لیست همه سفارشات (فقط ادمین) |
| GET | `/orders/:id` | ✅ | ❌ | جزئیات یک سفارش |
| PATCH | `/orders/:id/status` | ✅ | ✅ | ویرایش وضعیت سفارش (فقط ادمین) |
| DELETE | `/orders/:id` | ✅ | ❌ | لغو سفارش |

**Query Parameters برای GET /orders:**
- `page` (number): شماره صفحه
- `limit` (number): تعداد در صفحه
- `status` (string): فیلتر بر اساس وضعیت (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`)

---

## ❤️ علاقه‌مندی‌ها (Wishlist)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | ✅ | لیست علاقه‌مندی‌های کاربر |
| POST | `/wishlist` | ✅ | افزودن محصول به علاقه‌مندی‌ها |
| DELETE | `/wishlist/:productId` | ✅ | حذف محصول از علاقه‌مندی‌ها |
| GET | `/wishlist/check/:productId` | ✅ | بررسی وجود محصول در علاقه‌مندی‌ها |

---

## ⭐ نظرات (Reviews)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | `/reviews` | ✅ | ❌ | ثبت نظر برای محصول |
| GET | `/reviews/product/:productId` | ❌ | ❌ | نظرات یک محصول |
| GET | `/reviews` | ✅ | ✅ | دریافت همه نظرات (فقط ادمین) |
| PATCH | `/reviews/:id/approve` | ✅ | ✅ | تایید نظر (فقط ادمین) |
| DELETE | `/reviews/:id` | ✅ | ❌ | حذف نظر (کاربر یا ادمین) |

**Query Parameters برای GET /reviews:**
- `page` (number): شماره صفحه
- `limit` (number): تعداد در صفحه
- `approved` (boolean): فیلتر بر اساس تایید شده/نشده

---

## 📤 آپلود فایل (Upload)

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | `/upload/image` | ✅ | ✅ | آپلود یک تصویر |
| POST | `/upload/images` | ✅ | ✅ | آپلود چند تصویر (حداکثر 10) |

**Content-Type:** `multipart/form-data`
- برای `/upload/image`: فیلد `file`
- برای `/upload/images`: فیلد `files[]` (array)

---

## 🏥 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | بررسی وضعیت سرور و دیتابیس |

---

## 📊 خلاصه آمار

- **کل Endpoint ها:** 50+
- **Public (بدون Auth):** 15
- **Protected (نیاز به Auth):** 35+
- **Admin Only:** 15+

---

## 🔑 کدهای وضعیت HTTP

| کد | معنی |
|----|------|
| 200 | موفق |
| 201 | ایجاد شد |
| 400 | درخواست نامعتبر |
| 401 | احراز هویت نشده |
| 403 | دسترسی ممنوع |
| 404 | یافت نشد |
| 409 | تضاد (مثلاً ایمیل تکراری) |
| 429 | تعداد درخواست بیش از حد |
| 500 | خطای سرور |

---

## ⚡ Rate Limiting

- **عمومی:** 100 درخواست در دقیقه
- **احراز هویت:** 5 درخواست در دقیقه
- **آپلود:** 10 درخواست در دقیقه

---

## 📝 نمونه استفاده

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.moramor.shop/api/v1',
});

// تنظیم token
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

// دریافت محصولات
const getProducts = async () => {
  const { data } = await api.get('/products', {
    params: {
      page: 1,
      limit: 16,
      category: 'necklaces'
    }
  });
  return data;
};

// افزودن به سبد
const addToCart = async (productId, quantity) => {
  const { data } = await api.post('/cart', {
    productId,
    quantity
  });
  return data;
};
```

### cURL

```bash
# ثبت‌نام
curl -X POST https://api.moramor.shop/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "علی محمدی",
    "email": "ali@example.com",
    "password": "Password@123"
  }'

# دریافت محصولات
curl https://api.moramor.shop/api/v1/products?page=1&limit=10

# افزودن به سبد (با توکن)
curl -X POST https://api.moramor.shop/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod123",
    "quantity": 2
  }'
```

---

**نکته:** برای اطلاعات بیشتر و مستندات کامل، به [Swagger Documentation](https://api.moramor.shop/api-docs) مراجعه کنید.




