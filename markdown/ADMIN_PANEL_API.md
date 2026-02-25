# مستندات کامل API پنل ادمین - Moramor Core

## 📋 فهرست مطالب

1. [مقدمه](#مقدمه)
2. [احراز هویت](#احراز-هویت)
3. [مدیریت محصولات](#مدیریت-محصولات)
4. [مدیریت دسته‌بندی‌ها](#مدیریت-دسته‌بندی‌ها)
5. [مدیریت سفارشات](#مدیریت-سفارشات)
6. [مدیریت کاربران](#مدیریت-کاربران)
7. [مدیریت نظرات](#مدیریت-نظرات)
8. [آپلود فایل](#آپلود-فایل)
9. [کدهای وضعیت HTTP](#کدهای-وضعیت-http)
10. [خطاهای رایج](#خطاهای-رایج)

---

## مقدمه

این مستند شامل تمام APIهای مربوط به پنل ادمین است. تمام این APIها نیاز به احراز هویت دارند و فقط کاربران با نقش `ADMIN` یا `SUPER_ADMIN` می‌توانند از آن‌ها استفاده کنند.

### Base URL
```
http://localhost:3000/api/v1
```

### احراز هویت
تمام درخواست‌ها به APIهای پنل ادمین باید شامل هدر `Authorization` با فرمت زیر باشند:

```
Authorization: Bearer <access_token>
```

### فرمت پاسخ
تمام پاسخ‌ها به صورت JSON هستند.

---

## احراز هویت

### ورود به سیستم (Login) با ایمیل/پسورد (پنل ادمین)

**Endpoint:** `POST /auth/login`

**دسترسی:** عمومی (نیازی به احراز هویت ندارد) – در سرور فقط برای نقش‌های `ADMIN` و `SUPER_ADMIN` مجاز است.

**درخواست:**
```json
{
  "email": "admin@moramor.com",
  "password": "Admin@123456"
}
```

**پاسخ موفق (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@moramor.com",
    "name": "مدیر سیستم",
    "role": "ADMIN"
  }
}
```

### ورود با OTP (اختیاری)

در صورت نیاز می‌توانید به‌جای پسورد از OTP هم برای ادمین استفاده کنید:

- `POST /auth/send-code`
- `POST /auth/verify-code`

---

### تمدید توکن (Refresh Token)

**Endpoint:** `POST /auth/refresh`

**دسترسی:** نیاز به `refreshToken` دارد

**درخواست:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**پاسخ موفق (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### دریافت اطلاعات کاربر جاری (Get Current User)

**Endpoint:** `GET /auth/me`

**دسترسی:** نیاز به احراز هویت دارد

**پاسخ موفق (200):**
```json
{
  "id": "user-id",
  "email": "admin@moramor.com",
  "name": "مدیر سیستم",
  "phone": "09123456789",
  "role": "ADMIN",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## مدیریت محصولات

### ایجاد محصول جدید

**Endpoint:** `POST /products`

**دسترسی:** فقط ادمین

**درخواست:**
```json
{
  "name": "گردنبند چشم ببر",
  "slug": "tigers-eye-necklace",
  "description": "گردنبند زیبا با سنگ چشم ببر طبیعی",
  "price": 2500000,
  "discount": 10,
  "categoryId": "category-id-here",
  "materials": ["چشم ببر", "نقره"],
  "images": ["/products/image1.jpg", "/products/image2.jpg"],
  "stock": 15,
  "sku": "NEK-001",
  "weight": 12.5,
  "dimensions": {
    "length": 50,
    "width": 10,
    "height": 5
  },
  "isFeatured": true,
  "isActive": true,
  "metaTitle": "گردنبند چشم ببر - مُرامُر",
  "metaDescription": "خرید گردنبند چشم ببر با بهترین کیفیت"
}
```

**فیلدهای اجباری:**
- `name`: نام محصول
- `slug`: شناسه یکتا برای URL (باید منحصر به فرد باشد)
- `price`: قیمت به ریال
- `categoryId`: شناسه دسته‌بندی
- `stock`: موجودی انبار

**فیلدهای اختیاری:**
- `description`: توضیحات محصول
- `discount`: درصد تخفیف (0-100)
- `materials`: آرایه‌ای از مواد اولیه
- `images`: آرایه‌ای از آدرس تصاویر
- `sku`: کد محصول
- `weight`: وزن به گرم
- `dimensions`: ابعاد محصول (object)
- `isFeatured`: آیا محصول ویژه است؟
- `isActive`: آیا محصول فعال است؟
- `metaTitle`: عنوان متا برای SEO
- `metaDescription`: توضیحات متا برای SEO

**پاسخ موفق (201):**
```json
{
  "id": "product-id",
  "name": "گردنبند چشم ببر",
  "slug": "tigers-eye-necklace",
  "description": "گردنبند زیبا با سنگ چشم ببر طبیعی",
  "price": 2500000,
  "discount": 10,
  "categoryId": "category-id-here",
  "materials": ["چشم ببر", "نقره"],
  "images": ["/products/image1.jpg", "/products/image2.jpg"],
  "stock": 15,
  "sku": "NEK-001",
  "weight": 12.5,
  "dimensions": {
    "length": 50,
    "width": 10,
    "height": 5
  },
  "isFeatured": true,
  "isActive": true,
  "metaTitle": "گردنبند چشم ببر - مُرامُر",
  "metaDescription": "خرید گردنبند چشم ببر با بهترین کیفیت",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `409`: محصول با این slug قبلاً ایجاد شده است
- `404`: دسته‌بندی یافت نشد
- `400`: داده‌های ورودی نامعتبر است

---

### ویرایش محصول

**Endpoint:** `PATCH /products/:id`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه محصول

**درخواست:**
تمام فیلدهای DTO ایجاد محصول اختیاری هستند. فقط فیلدهایی که می‌خواهید تغییر دهید را ارسال کنید:

```json
{
  "price": 2300000,
  "discount": 15,
  "stock": 20,
  "isFeatured": false
}
```

**پاسخ موفق (200):**
```json
{
  "id": "product-id",
  "name": "گردنبند چشم ببر",
  "slug": "tigers-eye-necklace",
  "price": 2300000,
  "discount": 15,
  "stock": 20,
  "isFeatured": false,
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: محصول یافت نشد
- `409`: slug جدید قبلاً استفاده شده است
- `400`: داده‌های ورودی نامعتبر است

---

### حذف محصول

**Endpoint:** `DELETE /products/:id`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه محصول

**پاسخ موفق (200):**
```json
{
  "message": "محصول با موفقیت حذف شد"
}
```

**خطاهای احتمالی:**
- `404`: محصول یافت نشد

---

### دریافت لیست محصولات (با فیلتر)

**Endpoint:** `GET /products`

**دسترسی:** عمومی (نیازی به احراز هویت ندارد)

**پارامترهای Query:**

| پارامتر | نوع | پیش‌فرض | توضیحات |
|---------|-----|---------|---------|
| `page` | number | 1 | شماره صفحه |
| `limit` | number | 16 | تعداد آیتم در هر صفحه |
| `q` | string | - | جستجو در نام و توضیحات |
| `category` | string | - | فیلتر بر اساس slug دسته‌بندی |
| `min` | number | - | حداقل قیمت |
| `max` | number | - | حداکثر قیمت |
| `sort` | string | - | مرتب‌سازی: `price-asc`, `price-desc`, `newest`, `oldest`, `popular` |
| `featured` | boolean | - | فقط محصولات ویژه |

**مثال درخواست:**
```
GET /api/v1/products?page=1&limit=20&category=necklaces&sort=price-asc&featured=true
```

**پاسخ موفق (200):**
```json
{
  "data": [
    {
      "id": "product-id",
      "name": "گردنبند چشم ببر",
      "slug": "tigers-eye-necklace",
      "price": 2500000,
      "discount": 10,
      "images": ["/products/image1.jpg"],
      "category": {
        "id": "category-id",
        "name": "گردنبند",
        "slug": "necklaces"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## مدیریت دسته‌بندی‌ها

### ایجاد دسته‌بندی جدید

**Endpoint:** `POST /categories`

**دسترسی:** فقط ادمین

**درخواست:**
```json
{
  "name": "گردنبند",
  "slug": "necklaces",
  "description": "گردنبندهای زیبا و متنوع",
  "image": "/categories/necklaces.jpg",
  "parentId": "parent-category-id",
  "isActive": true,
  "sortOrder": 1
}
```

**فیلدهای اجباری:**
- `name`: نام دسته‌بندی
- `slug`: شناسه یکتا برای URL

**فیلدهای اختیاری:**
- `description`: توضیحات دسته‌بندی
- `image`: آدرس تصویر دسته‌بندی
- `parentId`: شناسه دسته‌بندی والد (برای دسته‌بندی‌های زیرمجموعه)
- `isActive`: آیا دسته‌بندی فعال است؟
- `sortOrder`: ترتیب نمایش

**پاسخ موفق (201):**
```json
{
  "id": "category-id",
  "name": "گردنبند",
  "slug": "necklaces",
  "description": "گردنبندهای زیبا و متنوع",
  "image": "/categories/necklaces.jpg",
  "parentId": "parent-category-id",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `409`: دسته‌بندی با این slug قبلاً ایجاد شده است
- `404`: دسته‌بندی والد یافت نشد
- `400`: داده‌های ورودی نامعتبر است

---

### ویرایش دسته‌بندی

**Endpoint:** `PATCH /categories/:id`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه دسته‌بندی

**درخواست:**
تمام فیلدهای DTO ایجاد دسته‌بندی اختیاری هستند:

```json
{
  "name": "گردنبند طلا",
  "isActive": false,
  "sortOrder": 2
}
```

**پاسخ موفق (200):**
```json
{
  "id": "category-id",
  "name": "گردنبند طلا",
  "slug": "necklaces",
  "isActive": false,
  "sortOrder": 2,
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: دسته‌بندی یافت نشد
- `409`: slug جدید قبلاً استفاده شده است
- `400`: داده‌های ورودی نامعتبر است

---

### حذف دسته‌بندی

**Endpoint:** `DELETE /categories/:id`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه دسته‌بندی

**پاسخ موفق (200):**
```json
{
  "message": "دسته‌بندی با موفقیت حذف شد"
}
```

**خطاهای احتمالی:**
- `404`: دسته‌بندی یافت نشد
- `400`: دسته‌بندی دارای محصول است و نمی‌تواند حذف شود

---

### دریافت لیست دسته‌بندی‌ها

**Endpoint:** `GET /categories`

**دسترسی:** عمومی (نیازی به احراز هویت ندارد)

**پارامترهای Query:**

| پارامتر | نوع | پیش‌فرض | توضیحات |
|---------|-----|---------|---------|
| `includeInactive` | boolean | false | شامل دسته‌بندی‌های غیرفعال |

**مثال درخواست:**
```
GET /api/v1/categories?includeInactive=true
```

**پاسخ موفق (200):**
```json
[
  {
    "id": "category-id",
    "name": "گردنبند",
    "slug": "necklaces",
    "description": "گردنبندهای زیبا و متنوع",
    "image": "/categories/necklaces.jpg",
    "isActive": true,
    "sortOrder": 1,
    "parent": {
      "id": "parent-category-id",
      "name": "زیورآلات",
      "slug": "jewelry"
    }
  }
]
```

---

## مدیریت سفارشات

### دریافت همه سفارشات (پنل ادمین)

**Endpoint:** `GET /orders/admin`

**دسترسی:** فقط ادمین

**پارامترهای Query:**

| پارامتر | نوع | پیش‌فرض | توضیحات |
|---------|-----|---------|---------|
| `page` | number | 1 | شماره صفحه |
| `limit` | number | 20 | تعداد آیتم در هر صفحه |
| `status` | string | - | فیلتر بر اساس وضعیت سفارش: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |
| `paymentStatus` | string | - | فیلتر بر اساس وضعیت پرداخت: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` |

**مثال درخواست:**
```
GET /api/v1/orders/admin?page=1&limit=20&status=CONFIRMED&paymentStatus=PAID
```

**پاسخ موفق (200):**
```json
{
  "data": [
    {
      "id": "order-id",
      "orderNumber": "ORD-2024-001",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "total": 2500000,
      "user": {
        "id": "user-id",
        "name": "علی محمدی",
        "email": "user@example.com"
      },
      "items": [
        {
          "product": {
            "id": "product-id",
            "name": "گردنبند چشم ببر",
            "price": 2500000
          },
          "quantity": 1,
          "price": 2500000
        }
      ],
      "address": {
        "city": "تهران",
        "address": "خیابان ولیعصر",
        "postalCode": "1234567890"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### دریافت جزئیات یک سفارش

**Endpoint:** `GET /orders/:id`

**دسترسی:** نیاز به احراز هویت دارد (ادمین می‌تواند همه سفارشات را ببیند)

**پارامترهای URL:**
- `id`: شناسه سفارش

**پاسخ موفق (200):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-2024-001",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "paymentMethod": "ZARINPAL",
  "total": 2500000,
  "subtotal": 2500000,
  "shippingCost": 0,
  "discount": 0,
  "user": {
    "id": "user-id",
    "name": "علی محمدی",
    "email": "user@example.com",
    "phone": "09123456789"
  },
  "items": [
    {
      "id": "order-item-id",
      "product": {
        "id": "product-id",
        "name": "گردنبند چشم ببر",
        "slug": "tigers-eye-necklace",
        "price": 2500000,
        "images": ["/products/image1.jpg"]
      },
      "quantity": 1,
      "price": 2500000
    }
  ],
  "address": {
    "id": "address-id",
    "city": "تهران",
    "province": "تهران",
    "address": "خیابان ولیعصر، پلاک 123",
    "postalCode": "1234567890",
    "receiverName": "علی محمدی",
    "receiverPhone": "09123456789"
  },
  "trackingCode": "TRACK123456",
  "adminNote": "سفارش آماده ارسال است",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: سفارش یافت نشد
- `403`: شما اجازه مشاهده این سفارش را ندارید (فقط برای کاربران عادی)

---

### ویرایش وضعیت سفارش

**Endpoint:** `PATCH /orders/:id/status`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه سفارش

**درخواست:**
```json
{
  "status": "SHIPPED",
  "trackingCode": "TRACK123456",
  "adminNote": "سفارش ارسال شد و کد پیگیری ارسال شده است"
}
```

**فیلدهای اجباری:**
- `status`: وضعیت جدید سفارش

**فیلدهای اختیاری:**
- `trackingCode`: کد پیگیری پست
- `adminNote`: یادداشت ادمین

**مقادیر مجاز برای `status`:**
- `PENDING`: در انتظار تایید
- `CONFIRMED`: تایید شده
- `PROCESSING`: در حال پردازش
- `SHIPPED`: ارسال شده
- `DELIVERED`: تحویل داده شده
- `CANCELLED`: لغو شده
- `REFUNDED`: بازپرداخت شده

**پاسخ موفق (200):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-2024-001",
  "status": "SHIPPED",
  "trackingCode": "TRACK123456",
  "adminNote": "سفارش ارسال شد و کد پیگیری ارسال شده است",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: سفارش یافت نشد
- `400`: وضعیت جدید نامعتبر است یا تغییر وضعیت مجاز نیست

---

### لغو سفارش (توسط ادمین)

**Endpoint:** `DELETE /orders/:id`

**دسترسی:** نیاز به احراز هویت دارد (ادمین می‌تواند هر سفارشی را لغو کند)

**پارامترهای URL:**
- `id`: شناسه سفارش

**پاسخ موفق (200):**
```json
{
  "message": "سفارش با موفقیت لغو شد",
  "order": {
    "id": "order-id",
    "status": "CANCELLED"
  }
}
```

**خطاهای احتمالی:**
- `404`: سفارش یافت نشد
- `400`: امکان لغو سفارش وجود ندارد (سفارش قبلاً ارسال یا تحویل داده شده است)

---

## مدیریت کاربران

### دریافت لیست کاربران

**Endpoint:** `GET /users`

**دسترسی:** فقط ادمین

**پارامترهای Query:**

| پارامتر | نوع | پیش‌فرض | توضیحات |
|---------|-----|---------|---------|
| `page` | number | 1 | شماره صفحه |
| `limit` | number | 20 | تعداد آیتم در هر صفحه |

**مثال درخواست:**
```
GET /api/v1/users?page=1&limit=20
```

**پاسخ موفق (200):**
```json
{
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "name": "علی محمدی",
      "phone": "09123456789",
      "role": "USER",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### دریافت اطلاعات یک کاربر

**Endpoint:** `GET /users/:id`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه کاربر

**پاسخ موفق (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "علی محمدی",
  "phone": "09123456789",
  "role": "USER",
  "emailVerified": true,
  "addresses": [
    {
      "id": "address-id",
      "city": "تهران",
      "address": "خیابان ولیعصر",
      "postalCode": "1234567890"
    }
  ],
  "orders": [
    {
      "id": "order-id",
      "orderNumber": "ORD-2024-001",
      "status": "DELIVERED",
      "total": 2500000
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: کاربر یافت نشد

---

## مدیریت نظرات

### دریافت همه نظرات

**Endpoint:** `GET /reviews`

**دسترسی:** فقط ادمین

**پارامترهای Query:**

| پارامتر | نوع | پیش‌فرض | توضیحات |
|---------|-----|---------|---------|
| `page` | number | 1 | شماره صفحه |
| `limit` | number | 20 | تعداد آیتم در هر صفحه |
| `approved` | boolean | - | فیلتر بر اساس تایید/عدم تایید |

**مثال درخواست:**
```
GET /api/v1/reviews?page=1&limit=20&approved=false
```

**پاسخ موفق (200):**
```json
{
  "data": [
    {
      "id": "review-id",
      "product": {
        "id": "product-id",
        "name": "گردنبند چشم ببر",
        "slug": "tigers-eye-necklace"
      },
      "user": {
        "id": "user-id",
        "name": "علی محمدی",
        "email": "user@example.com"
      },
      "rating": 5,
      "comment": "محصول عالی بود!",
      "approved": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### تایید نظر

**Endpoint:** `PATCH /reviews/:id/approve`

**دسترسی:** فقط ادمین

**پارامترهای URL:**
- `id`: شناسه نظر

**پاسخ موفق (200):**
```json
{
  "id": "review-id",
  "product": {
    "id": "product-id",
    "name": "گردنبند چشم ببر"
  },
  "user": {
    "id": "user-id",
    "name": "علی محمدی"
  },
  "rating": 5,
  "comment": "محصول عالی بود!",
  "approved": true,
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**خطاهای احتمالی:**
- `404`: نظر یافت نشد

---

### حذف نظر

**Endpoint:** `DELETE /reviews/:id`

**دسترسی:** نیاز به احراز هویت دارد (ادمین می‌تواند هر نظری را حذف کند)

**پارامترهای URL:**
- `id`: شناسه نظر

**پاسخ موفق (200):**
```json
{
  "message": "نظر با موفقیت حذف شد"
}
```

**خطاهای احتمالی:**
- `404`: نظر یافت نشد

---

## آپلود فایل

### آپلود یک تصویر

**Endpoint:** `POST /upload/image`

**دسترسی:** فقط ادمین

**نوع درخواست:** `multipart/form-data`

**محدودیت‌ها:**
- حداکثر حجم فایل: 5 مگابایت
- فرمت‌های مجاز: `jpg`, `jpeg`, `png`, `gif`, `webp`

**درخواست:**
```
Content-Type: multipart/form-data

file: [فایل تصویری]
```

**پاسخ موفق (201):**
```json
{
  "url": "https://s3.amazonaws.com/bucket/products/image-1234567890.jpg",
  "key": "products/image-1234567890.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

**خطاهای احتمالی:**
- `400`: فایل ارسال نشده است
- `400`: فرمت فایل مجاز نیست
- `400`: حجم فایل بیشتر از 5 مگابایت است

**نمونه استفاده با cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/upload/image \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/image.jpg"
```

**نمونه استفاده با JavaScript (Fetch API):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result.url); // URL تصویر آپلود شده
```

---

### آپلود چند تصویر

**Endpoint:** `POST /upload/images`

**دسترسی:** فقط ادمین

**نوع درخواست:** `multipart/form-data`

**محدودیت‌ها:**
- حداکثر تعداد فایل: 10
- حداکثر حجم هر فایل: 5 مگابایت
- فرمت‌های مجاز: `jpg`, `jpeg`, `png`, `gif`, `webp`

**درخواست:**
```
Content-Type: multipart/form-data

files: [فایل تصویری 1]
files: [فایل تصویری 2]
files: [فایل تصویری 3]
...
```

**پاسخ موفق (201):**
```json
[
  {
    "url": "https://s3.amazonaws.com/bucket/products/image-1.jpg",
    "key": "products/image-1.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  },
  {
    "url": "https://s3.amazonaws.com/bucket/products/image-2.jpg",
    "key": "products/image-2.jpg",
    "size": 345890,
    "mimetype": "image/png"
  }
]
```

**خطاهای احتمالی:**
- `400`: فایلی ارسال نشده است
- `400`: فرمت فایل مجاز نیست
- `400`: حجم فایل بیشتر از 5 مگابایت است

**نمونه استفاده با JavaScript (Fetch API):**
```javascript
const formData = new FormData();
for (let i = 0; i < fileInput.files.length; i++) {
  formData.append('files', fileInput.files[i]);
}

const response = await fetch('http://localhost:3000/api/v1/upload/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const results = await response.json();
results.forEach(result => {
  console.log(result.url); // URL هر تصویر
});
```

---

## کدهای وضعیت HTTP

| کد | معنی | توضیحات |
|----|------|---------|
| `200` | OK | درخواست با موفقیت انجام شد |
| `201` | Created | منبع جدید با موفقیت ایجاد شد |
| `400` | Bad Request | داده‌های ورودی نامعتبر است |
| `401` | Unauthorized | نیاز به احراز هویت دارد |
| `403` | Forbidden | دسترسی به این منبع مجاز نیست |
| `404` | Not Found | منبع یافت نشد |
| `409` | Conflict | تداخل با داده‌های موجود (مثلاً slug تکراری) |
| `500` | Internal Server Error | خطای سرور |

---

## خطاهای رایج

### خطای احراز هویت

**کد:** `401 Unauthorized`

**پاسخ:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "دسترسی غیرمجاز"
}
```

**راه حل:**
- بررسی کنید که هدر `Authorization` را ارسال کرده‌اید
- بررسی کنید که توکن معتبر است و منقضی نشده است
- از توکن `accessToken` استفاده کنید نه `refreshToken`

---

### خطای دسترسی

**کد:** `403 Forbidden`

**پاسخ:**
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "شما اجازه دسترسی به این منبع را ندارید"
}
```

**راه حل:**
- بررسی کنید که کاربر شما نقش `ADMIN` یا `SUPER_ADMIN` دارد
- از حساب کاربری ادمین استفاده کنید

---

### خطای اعتبارسنجی

**کد:** `400 Bad Request`

**پاسخ:**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

**راه حل:**
- تمام فیلدهای اجباری را ارسال کنید
- مقادیر را مطابق با نوع داده صحیح ارسال کنید
- قوانین اعتبارسنجی را رعایت کنید (مثلاً حداقل/حداکثر طول)

---

### خطای Slug تکراری

**کد:** `409 Conflict`

**پاسخ:**
```json
{
  "statusCode": 409,
  "message": "محصول با این slug قبلاً ایجاد شده است",
  "error": "Conflict"
}
```

**راه حل:**
- از slug دیگری استفاده کنید
- slug باید منحصر به فرد باشد

---

### خطای منبع یافت نشد

**کد:** `404 Not Found`

**پاسخ:**
```json
{
  "statusCode": 404,
  "message": "محصول یافت نشد",
  "error": "Not Found"
}
```

**راه حل:**
- بررسی کنید که شناسه (ID) صحیح است
- بررسی کنید که منبع واقعاً وجود دارد

---

## نکات مهم

1. **مدیریت توکن:** توکن‌های دسترسی (`accessToken`) معمولاً پس از مدت زمان مشخصی منقضی می‌شوند. همیشه پاسخ خطای `401` را مدیریت کنید و از `refreshToken` برای دریافت توکن جدید استفاده کنید.

2. **Pagination:** برای لیست‌های طولانی، حتماً از pagination استفاده کنید. پارامترهای `page` و `limit` را تنظیم کنید.

3. **فیلتر و جستجو:** برای بهبود عملکرد، از فیلترها و پارامترهای جستجو استفاده کنید تا فقط داده‌های مورد نیاز را دریافت کنید.

4. **آپلود تصویر:** قبل از ارسال محصول، ابتدا تصاویر را آپلود کنید و URLهای برگشتی را در فیلد `images` محصول ذخیره کنید.

5. **مدیریت خطا:** همیشه پاسخ‌های خطا را مدیریت کنید و پیام‌های مناسب به کاربر نمایش دهید.

6. **Rate Limiting:** ممکن است محدودیت نرخ درخواست وجود داشته باشد. در صورت دریافت خطای `429 Too Many Requests`، کمی صبر کنید و دوباره تلاش کنید.

---

## مثال‌های کامل

### مثال: ایجاد محصول جدید با تصویر

```javascript
// 1. آپلود تصویر
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await fetch('http://localhost:3000/api/v1/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const { url: imageUrl } = await uploadResponse.json();

// 2. ایجاد محصول
const productResponse = await fetch('http://localhost:3000/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'گردنبند چشم ببر',
    slug: 'tigers-eye-necklace',
    description: 'گردنبند زیبا با سنگ چشم ببر طبیعی',
    price: 2500000,
    discount: 10,
    categoryId: 'category-id-here',
    images: [imageUrl],
    stock: 15,
    isFeatured: true,
    isActive: true
  })
});

const product = await productResponse.json();
console.log('محصول ایجاد شد:', product);
```

### مثال: تغییر وضعیت چند سفارش

```javascript
const orderIds = ['order-id-1', 'order-id-2', 'order-id-3'];

for (const orderId of orderIds) {
  const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'SHIPPED',
      trackingCode: `TRACK${orderId.slice(-6)}`,
      adminNote: 'سفارش ارسال شد'
    })
  });

  if (response.ok) {
    const order = await response.json();
    console.log(`سفارش ${order.orderNumber} به وضعیت SHIPPED تغییر یافت`);
  }
}
```

---

## پشتیبانی

برای سوالات و مشکلات بیشتر، به مستندات Swagger مراجعه کنید:
```
http://localhost:3000/api-docs
```

یا با تیم توسعه تماس بگیرید.

---

**آخرین به‌روزرسانی:** 2024-01-20
**نسخه API:** 1.0

