# 📖 راهنمای جامع API

این سند راهنمای کامل استفاده از API Moramor است.

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.moramor.com/api/v1
```

## احراز هویت

تمام endpointهای محافظت‌شده نیاز به Bearer Token دارند:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### دریافت Token

**ثبت‌نام:**

```http
POST /auth/register
Content-Type: application/json

{
  "name": "علی محمدی",
  "email": "ali@example.com",
  "password": "Password@123",
  "phone": "09123456789"
}
```

**پاسخ:**

```json
{
  "user": {
    "id": "clr1234...",
    "name": "علی محمدی",
    "email": "ali@example.com",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**ورود:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "Password@123"
}
```

**تمدید Token:**

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## محصولات

### لیست محصولات

```http
GET /products?page=1&limit=16&category=necklaces&min=100000&max=500000&sort=price-asc
```

**Query Parameters:**

| پارامتر | نوع | توضیحات |
|--------|-----|---------|
| page | number | شماره صفحه (پیش‌فرض: 1) |
| limit | number | تعداد در صفحه (پیش‌فرض: 16) |
| q | string | جستجو در نام و توضیحات |
| category | string | فیلتر بر اساس slug دسته‌بندی |
| min | number | حداقل قیمت |
| max | number | حداکثر قیمت |
| sort | string | مرتب‌سازی: `price-asc`, `price-desc`, `newest`, `oldest` |
| featured | boolean | فقط محصولات ویژه |

**پاسخ:**

```json
{
  "data": [
    {
      "id": "clr123...",
      "name": "گردنبند چشم ببر",
      "slug": "tigers-eye-necklace",
      "price": 2500000,
      "discount": 10,
      "images": ["/products/image1.jpg"],
      "stock": 15,
      "category": {
        "id": "cat123...",
        "name": "گردنبند",
        "slug": "necklaces"
      },
      "averageRating": 4.5,
      "reviewCount": 12
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 16,
    "totalPages": 4
  }
}
```

### جزئیات محصول

```http
GET /products/:id
GET /products/slug/:slug
```

**پاسخ:**

```json
{
  "id": "clr123...",
  "name": "گردنبند چشم ببر",
  "slug": "tigers-eye-necklace",
  "description": "گردنبند زیبا با سنگ چشم ببر طبیعی",
  "price": 2500000,
  "discount": 10,
  "materials": ["چشم ببر", "نقره"],
  "images": ["/products/image1.jpg"],
  "stock": 15,
  "weight": 12.5,
  "category": { ... },
  "reviews": [
    {
      "id": "rev123...",
      "rating": 5,
      "comment": "محصول عالی!",
      "user": {
        "id": "user123...",
        "name": "علی"
      },
      "createdAt": "2025-01-13T10:00:00Z"
    }
  ],
  "averageRating": 4.5,
  "reviewCount": 12
}
```

### ایجاد محصول (Admin)

```http
POST /products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "گردنبند جدید",
  "slug": "new-necklace",
  "description": "توضیحات",
  "price": 3000000,
  "discount": 0,
  "categoryId": "cat123...",
  "materials": ["طلا", "الماس"],
  "images": ["/products/new-image.jpg"],
  "stock": 10,
  "sku": "NEK-002",
  "isFeatured": true
}
```

## دسته‌بندی‌ها

### لیست دسته‌بندی‌ها

```http
GET /categories
```

**پاسخ:**

```json
[
  {
    "id": "cat123...",
    "name": "گردنبند",
    "slug": "necklaces",
    "description": "گردنبندهای زیبا",
    "image": "/categories/necklaces.jpg",
    "sortOrder": 1,
    "children": [],
    "_count": {
      "products": 25
    }
  }
]
```

## سبد خرید

### مشاهده سبد

```http
GET /cart
Authorization: Bearer YOUR_TOKEN
```

**پاسخ:**

```json
{
  "id": "cart123...",
  "items": [
    {
      "id": "item123...",
      "quantity": 2,
      "product": {
        "id": "prod123...",
        "name": "گردنبند چشم ببر",
        "price": 2500000,
        "discount": 10,
        "images": ["/products/image1.jpg"]
      }
    }
  ],
  "subtotal": 5000000,
  "discount": 500000,
  "total": 4500000,
  "itemCount": 2
}
```

### افزودن به سبد

```http
POST /cart
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "productId": "prod123...",
  "quantity": 2
}
```

### ویرایش آیتم

```http
PUT /cart/:itemId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "quantity": 3
}
```

### حذف از سبد

```http
DELETE /cart/:itemId
Authorization: Bearer YOUR_TOKEN
```

### خالی کردن سبد

```http
DELETE /cart
Authorization: Bearer YOUR_TOKEN
```

## آدرس‌ها

### لیست آدرس‌ها

```http
GET /addresses
Authorization: Bearer YOUR_TOKEN
```

### ایجاد آدرس

```http
POST /addresses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "خانه",
  "fullName": "علی محمدی",
  "phone": "09123456789",
  "province": "تهران",
  "city": "تهران",
  "address": "خیابان ولیعصر، پلاک 123",
  "postalCode": "1234567890",
  "isDefault": true
}
```

## تسویه‌حساب و پرداخت

### شروع خرید

```http
POST /checkout
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "addressId": "addr123...",
  "paymentMethod": "ZARINPAL",
  "customerNote": "لطفاً با دقت بسته‌بندی شود"
}
```

**پاسخ:**

```json
{
  "orderId": "order123...",
  "orderNumber": "ORD-20250113-00001",
  "totalPrice": 4500000,
  "paymentUrl": "https://www.zarinpal.com/pg/StartPay/...",
  "authority": "A00000000000000000000000000123456789"
}
```

**جریان پرداخت:**

1. کاربر به `paymentUrl` هدایت می‌شود
2. پرداخت در درگاه انجام می‌شود
3. بازگشت به `/checkout/verify?Authority=...&Status=OK`
4. تایید خودکار پرداخت و ثبت سفارش

### روش‌های پرداخت

| مقدار | توضیح |
|------|-------|
| ZARINPAL | درگاه زرین‌پال |
| NEXTPAY | درگاه نکست‌پی |
| CASH_ON_DELIVERY | پرداخت در محل |
| BANK_TRANSFER | واریز بانکی |

## سفارشات

### لیست سفارشات

```http
GET /orders?page=1&limit=20&status=PENDING
Authorization: Bearer YOUR_TOKEN
```

**وضعیت‌های سفارش:**

- `PENDING` - در انتظار
- `CONFIRMED` - تایید شده
- `PROCESSING` - در حال پردازش
- `SHIPPED` - ارسال شده
- `DELIVERED` - تحویل داده شده
- `CANCELLED` - لغو شده
- `REFUNDED` - مرجوع شده

### جزئیات سفارش

```http
GET /orders/:id
Authorization: Bearer YOUR_TOKEN
```

**پاسخ:**

```json
{
  "id": "order123...",
  "orderNumber": "ORD-20250113-00001",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "items": [
    {
      "product": { ... },
      "quantity": 2,
      "price": 2500000
    }
  ],
  "subtotal": 5000000,
  "discount": 500000,
  "totalPrice": 4500000,
  "shippingAddress": { ... },
  "trackingCode": "12345678",
  "createdAt": "2025-01-13T10:00:00Z",
  "paidAt": "2025-01-13T10:05:00Z"
}
```

### لغو سفارش

```http
DELETE /orders/:id
Authorization: Bearer YOUR_TOKEN
```

**محدودیت‌ها:**
- فقط سفارشات پرداخت نشده یا تایید نشده قابل لغو هستند
- سفارشات ارسال شده قابل لغو نیستند

## علاقه‌مندی‌ها

### لیست علاقه‌مندی‌ها

```http
GET /wishlist
Authorization: Bearer YOUR_TOKEN
```

### افزودن به علاقه‌مندی‌ها

```http
POST /wishlist
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "productId": "prod123..."
}
```

### حذف از علاقه‌مندی‌ها

```http
DELETE /wishlist/:productId
Authorization: Bearer YOUR_TOKEN
```

### بررسی وجود در علاقه‌مندی‌ها

```http
GET /wishlist/check/:productId
Authorization: Bearer YOUR_TOKEN
```

## نظرات

### ثبت نظر

```http
POST /reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "productId": "prod123...",
  "rating": 5,
  "comment": "محصول فوق‌العاده بود!"
}
```

**امتیاز:** عدد بین 1 تا 5

### نظرات یک محصول

```http
GET /reviews/product/:productId
```

## آپلود فایل (Admin)

### آپلود تک تصویر

```http
POST /upload/image
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data

file: [binary data]
```

**پاسخ:**

```json
{
  "url": "http://localhost:9000/moramor-products/products/uuid.jpg",
  "key": "products/uuid.jpg",
  "size": 245678
}
```

### آپلود چند تصویر

```http
POST /upload/images
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data

files[]: [binary data]
files[]: [binary data]
```

## کدهای خطا

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

## Rate Limiting

- عمومی: 100 درخواست در دقیقه
- احراز هویت: 5 درخواست در دقیقه
- آپلود: 10 درخواست در دقیقه

**پاسخ در صورت تجاوز:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## نمونه کد

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
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
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "علی محمدی",
    "email": "ali@example.com",
    "password": "Password@123"
  }'

# دریافت محصولات
curl http://localhost:3000/api/v1/products?page=1&limit=10

# افزودن به سبد (با توکن)
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod123",
    "quantity": 2
  }'
```

---

برای اطلاعات بیشتر، [Swagger Documentation](http://localhost:3000/api-docs) را مشاهده کنید.

