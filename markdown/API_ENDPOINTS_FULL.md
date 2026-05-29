# لیست کامل API بک‌اند (Moramor)

این سند بر اساس `@Controller()` و دکوریتورها (`@Get/@Post/@Put/@Delete/@Patch/@Query/@Param/@Body`) در پروژه‌ی بک‌اند تهیه شده است.

> نکته: در `src/main.ts` مقدار `API_PREFIX` به صورت پیش‌فرض `api/v1` است؛ بنابراین همه‌ی مسیرها با `/api/v1` گزارش می‌شوند.

---

## `RootController` (App root)

- `GET /api/v1` — اطلاع‌رسانی ریشه API (`name`, `version`، مسیرهای نمونه، و …) | Query: ندارد | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `RootController` / ماژول: `AppModule`

---

## `HealthController` (`src/health/health.controller.ts`)

- `GET /api/v1/health` — بررسی سلامت سرویس و وضعیت اتصال به دیتابیس | Query: ندارد | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `HealthController` / ماژول: `AppModule`

---

## `AuthController` (`src/modules/auth/auth.controller.ts`)

- `POST /api/v1/auth/refresh` — تولید توکن جدید با استفاده از `Refresh Token` | Query: ندارد | Params: ندارد | Body: `RefreshTokenDto` | Auth: عمومی | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/login` — ورود با ایمیل و رمز عبور (فقط برای نقش‌های ادمین) | Query: ندارد | Params: ندارد | Body: `LoginDto` | Auth: عمومی (اما فقط `ADMIN`/`SUPER_ADMIN`) | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/logout` — خروج از حساب کاربری (چرخش/ابطال Refresh Token) | Query: ندارد | Params: ندارد | Body: `RefreshTokenDto` | Auth: محافظت‌شده (JWT) | Controller: `AuthController` / ماژول: `AuthModule`
- `GET /api/v1/auth/me` — دریافت اطلاعات کاربر جاری | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/forgot-password` — درخواست بازیابی رمز عبور (ارسال لینک به ایمیل) | Query: ندارد | Params: ندارد | Body: `ForgotPasswordDto` | Auth: عمومی | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/reset-password` — بازیابی رمز عبور با توکن ارسالی از ایمیل | Query: ندارد | Params: ندارد | Body: `ResetPasswordDto` | Auth: عمومی | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/send-otp` — ارسال OTP Mock به موبایل | Query: ندارد | Params: ندارد | Body: `SendOtpDto` | Auth: عمومی | Controller: `AuthController` / ماژول: `AuthModule`
- `POST /api/v1/auth/verify-otp` — تأیید OTP Mock و دریافت توکن‌های دسترسی | Query: ندارد | Params: ندارد | Body: `VerifyOtpDto` | Auth: عمومی | Controller: `AuthController` / ماژول: `AuthModule`

---

## `CategoriesController` (`src/modules/categories/categories.controller.ts`)

- `POST /api/v1/categories` — ایجاد دسته‌بندی جدید (فقط ادمین) | Query: ندارد | Params: ندارد | Body: `CreateCategoryDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `CategoriesController` / ماژول: `CategoriesModule`
- `GET /api/v1/categories` — دریافت لیست دسته‌بندی‌ها | Query: `includeInactive` (اختیاری: boolean) | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `CategoriesController` / ماژول: `CategoriesModule`
- `GET /api/v1/categories/slug/:slug` — دریافت دسته‌بندی بر اساس `slug` | Query: ندارد | Params: `slug` | Body: ندارد | Auth: عمومی | Controller: `CategoriesController` / ماژول: `CategoriesModule`
- `GET /api/v1/categories/:id` — دریافت دسته‌بندی بر اساس `id` | Query: ندارد | Params: `id` | Body: ندارد | Auth: عمومی | Controller: `CategoriesController` / ماژول: `CategoriesModule`
- `PATCH /api/v1/categories/:id` — ویرایش دسته‌بندی (فقط ادمین) | Query: ندارد | Params: `id` | Body: `UpdateCategoryDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `CategoriesController` / ماژول: `CategoriesModule`
- `DELETE /api/v1/categories/:id` — حذف دسته‌بندی (فقط ادمین) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `CategoriesController` / ماژول: `CategoriesModule`

---

## `ProductsController` (`src/modules/products/products.controller.ts`)

- `POST /api/v1/products` — ایجاد محصول جدید (فقط ادمین) | Query: ندارد | Params: ندارد | Body: `CreateProductDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ProductsController` / ماژول: `ProductsModule`
- `GET /api/v1/products` — دریافت لیست محصولات با جستجو/فیلتر | Query: `QueryProductDto` (اختیاری، شامل `page/limit/q/category/min/max/sort/featured`) | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `ProductsController` / ماژول: `ProductsModule`
- `GET /api/v1/products/flash-sales` — دریافت محصولات فروش ویژه (فلش‌سیل) | Query: ندارد | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `ProductsController` / ماژول: `ProductsModule`
- `GET /api/v1/products/slug/:slug` — دریافت محصول بر اساس `slug` | Query: ندارد | Params: `slug` | Body: ندارد | Auth: عمومی | Controller: `ProductsController` / ماژول: `ProductsModule`
- `GET /api/v1/products/:id` — دریافت محصول بر اساس `id` | Query: ندارد | Params: `id` | Body: ندارد | Auth: عمومی | Controller: `ProductsController` / ماژول: `ProductsModule`
- `PATCH /api/v1/products/:id` — ویرایش محصول (فقط ادمین) | Query: ندارد | Params: `id` | Body: `UpdateProductDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ProductsController` / ماژول: `ProductsModule`
- `PATCH /api/v1/products/:id/best-seller` — به‌روزرسانی وضعیت پرفروش بودن محصول (فقط ادمین) | Query: ندارد | Params: `id` | Body: `UpdateBestSellerStatusDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ProductsController` / ماژول: `ProductsModule`
- `DELETE /api/v1/products/:id` — حذف محصول (فقط ادمین) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ProductsController` / ماژول: `ProductsModule`

---

## `OrdersController` (`src/modules/orders/orders.controller.ts`)

- `GET /api/v1/orders` — دریافت لیست سفارشات کاربر جاری | Query: `QueryOrderDto` (اختیاری: `page` پیش‌فرض `1`، `limit` پیش‌فرض `20`، `status`، `paymentStatus`) | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `OrdersController` / ماژول: `OrdersModule`
- `GET /api/v1/orders/admin` — دریافت همه سفارشات (فقط ادمین) | Query: `QueryOrderDto` (اختیاری: `page` پیش‌فرض `1`، `limit` پیش‌فرض `20`، `status`، `paymentStatus`) | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `OrdersController` / ماژول: `OrdersModule`
- `GET /api/v1/orders/:id` — دریافت جزئیات یک سفارش (ادمین به همه دسترسی دارد) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `OrdersController` / ماژول: `OrdersModule`
- `PATCH /api/v1/orders/:id/status` — ویرایش وضعیت سفارش (فقط ادمین) | Query: ندارد | Params: `id` | Body: `UpdateOrderStatusDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `OrdersController` / ماژول: `OrdersModule`
- `DELETE /api/v1/orders/:id` — لغو سفارش (ادمین مجاز به لغو هر سفارش؛ کاربر فقط سفارش‌های خودش) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `OrdersController` / ماژول: `OrdersModule`

---

## `CheckoutController` (`src/modules/checkout/checkout.controller.ts`)

- `POST /api/v1/checkout` — شروع فرآیند خرید/پرداخت | Query: ندارد | Params: ندارد | Body: `CreateCheckoutDto` | Auth: محافظت‌شده (JWT) | Controller: `CheckoutController` / ماژول: `CheckoutModule`
- `GET /api/v1/checkout/verify` — تایید پرداخت (Callback از درگاه) | Query: `Authority` (string, معمولاً لازم)، `Status` (string, معمولاً لازم) | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `CheckoutController` / ماژول: `CheckoutModule`

---

## `AddressesController` (`src/modules/addresses/addresses.controller.ts`)

- `POST /api/v1/addresses` — ایجاد آدرس جدید | Query: ندارد | Params: ندارد | Body: `CreateAddressDto` | Auth: محافظت‌شده (JWT) | Controller: `AddressesController` / ماژول: `AddressesModule`
- `GET /api/v1/addresses` — دریافت لیست آدرس‌های کاربر جاری | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `AddressesController` / ماژول: `AddressesModule`
- `GET /api/v1/addresses/:id` — دریافت یک آدرس بر اساس `id` | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `AddressesController` / ماژول: `AddressesModule`
- `PATCH /api/v1/addresses/:id` — ویرایش آدرس | Query: ندارد | Params: `id` | Body: `UpdateAddressDto` | Auth: محافظت‌شده (JWT) | Controller: `AddressesController` / ماژول: `AddressesModule`
- `DELETE /api/v1/addresses/:id` — حذف آدرس | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `AddressesController` / ماژول: `AddressesModule`

---

## `CartController` (`src/modules/cart/cart.controller.ts`)

- `GET /api/v1/cart` — دریافت سبد خرید کاربر جاری | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `CartController` / ماژول: `CartModule`
- `POST /api/v1/cart` — افزودن محصول به سبد خرید | Query: ندارد | Params: ندارد | Body: `AddToCartDto` | Auth: محافظت‌شده (JWT) | Controller: `CartController` / ماژول: `CartModule`
- `PUT /api/v1/cart/:itemId` — ویرایش تعداد محصول در سبد خرید | Query: ندارد | Params: `itemId` | Body: `UpdateCartItemDto` | Auth: محافظت‌شده (JWT) | Controller: `CartController` / ماژول: `CartModule`
- `DELETE /api/v1/cart/:itemId` — حذف آیتم از سبد خرید | Query: ندارد | Params: `itemId` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `CartController` / ماژول: `CartModule`
- `DELETE /api/v1/cart` — خالی کردن سبد خرید | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `CartController` / ماژول: `CartModule`

---

## `WishlistController` (`src/modules/wishlist/wishlist.controller.ts`)

- `GET /api/v1/wishlist` — دریافت علاقه‌مندی‌های کاربر جاری | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `WishlistController` / ماژول: `WishlistModule`
- `POST /api/v1/wishlist` — افزودن محصول به علاقه‌مندی‌ها | Query: ندارد | Params: ندارد | Body: `AddToWishlistDto` | Auth: محافظت‌شده (JWT) | Controller: `WishlistController` / ماژول: `WishlistModule`
- `DELETE /api/v1/wishlist/:productId` — حذف محصول از علاقه‌مندی‌ها | Query: ندارد | Params: `productId` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `WishlistController` / ماژول: `WishlistModule`
- `GET /api/v1/wishlist/check/:productId` — بررسی وجود محصول در علاقه‌مندی‌ها | Query: ندارد | Params: `productId` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `WishlistController` / ماژول: `WishlistModule`

---

## `ReviewsController` (`src/modules/reviews/reviews.controller.ts`)

- `POST /api/v1/reviews` — ثبت نظر برای محصول | Query: ندارد | Params: ندارد | Body: `CreateReviewDto` | Auth: محافظت‌شده (JWT) | Controller: `ReviewsController` / ماژول: `ReviewsModule`
- `GET /api/v1/reviews/product/:productId` — دریافت نظرات یک محصول | Query: ندارد | Params: `productId` | Body: ندارد | Auth: عمومی | Controller: `ReviewsController` / ماژول: `ReviewsModule`
- `GET /api/v1/reviews` — دریافت همه نظرات (فقط ادمین) | Query: `QueryReviewDto` (اختیاری: `page` پیش‌فرض `1`، `limit` پیش‌فرض `20`، `approved`) | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ReviewsController` / ماژول: `ReviewsModule`
- `PATCH /api/v1/reviews/:id/approve` — تایید نظر (فقط ادمین) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `ReviewsController` / ماژول: `ReviewsModule`
- `DELETE /api/v1/reviews/:id` — حذف نظر (ادمین: آزاد، کاربر: فقط نظرات خودش) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `ReviewsController` / ماژول: `ReviewsModule`

---

## `CollectionsController` (`src/modules/collections/collections.controller.ts`)

- `GET /api/v1/collections` — دریافت لیست کالکشن‌های فعال | Query: ندارد | Params: ندارد | Body: ندارد | Auth: عمومی | Controller: `CollectionsController` / ماژول: `CollectionsModule`
- `GET /api/v1/collections/:slug` — دریافت کالکشن فعال بر اساس `slug` همراه با محصولات | Query: ندارد | Params: `slug` | Body: ندارد | Auth: عمومی | Controller: `CollectionsController` / ماژول: `CollectionsModule`

---

## `AdminCollectionsController` (`src/modules/collections/admin-collections.controller.ts`)

- `POST /api/v1/admin/collections` — ایجاد کالکشن جدید (فقط ادمین) | Query: ندارد | Params: ندارد | Body: `CreateCollectionDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `AdminCollectionsController` / ماژول: `CollectionsModule`
- `PUT /api/v1/admin/collections/:id` — ویرایش کالکشن (فقط ادمین) | Query: ندارد | Params: `id` | Body: `UpdateCollectionDto` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `AdminCollectionsController` / ماژول: `CollectionsModule`
- `DELETE /api/v1/admin/collections/:id` — حذف (نرم) کالکشن (فقط ادمین) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `AdminCollectionsController` / ماژول: `CollectionsModule`

---

## `UsersController` (`src/modules/users/users.controller.ts`)

- `GET /api/v1/users/profile` — دریافت پروفایل کاربر جاری | Query: ندارد | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT) | Controller: `UsersController` / ماژول: `UsersModule`
- `PUT /api/v1/users/profile` — ویرایش پروفایل کاربر جاری | Query: ندارد | Params: ندارد | Body: `UpdateUserDto` | Auth: محافظت‌شده (JWT) | Controller: `UsersController` / ماژول: `UsersModule`
- `GET /api/v1/users` — دریافت لیست کاربران (فقط ادمین) | Query: `QueryUserDto` (اختیاری: `page` پیش‌فرض `1`، `limit` پیش‌فرض `20`) | Params: ندارد | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `UsersController` / ماژول: `UsersModule`
- `GET /api/v1/users/:id` — دریافت اطلاعات یک کاربر (فقط ادمین) | Query: ندارد | Params: `id` | Body: ندارد | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `UsersController` / ماژول: `UsersModule`

---

## `UploadController` (`src/modules/upload/upload.controller.ts`)

- `POST /api/v1/upload/image` — آپلود یک تصویر (فقط ادمین) | Query: ندارد | Params: ندارد | Body: فایل multipart با کلید `file` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `UploadController` / ماژول: `UploadModule`
- `POST /api/v1/upload/images` — آپلود چند تصویر (فقط ادمین) | Query: ندارد | Params: ندارد | Body: فایل‌های multipart با کلید `files` | Auth: محافظت‌شده (JWT + نقش ادمین) | Controller: `UploadController` / ماژول: `UploadModule`

---

## بخش ویژه: Query / Pagination / Search / Filter

در این بخش فقط endpointهایی که از `@Query()` استفاده می‌کنند یا رفتار pagination/search/filter دارند لیست می‌شوند.

- `GET /api/v1/categories` — فهرست دسته‌بندی‌ها (امکان نمایش غیرفعال‌ها) | Query:
  - `includeInactive` (اختیاری، boolean)
  - Params: ندارد | Auth: عمومی

- `GET /api/v1/products` — لیست محصولات با جستجو/فیلتر و pagination | Query:
  - `page` (اختیاری، پیش‌فرض: `1`)
  - `limit` (اختیاری، پیش‌فرض: `16`)
  - `q` (اختیاری، جستجو در نام/توضیحات)
  - `category` (اختیاری، فیلتر بر اساس slug دسته‌بندی)
  - `min` (اختیاری، حداقل قیمت)
  - `max` (اختیاری، حداکثر قیمت)
  - `sort` (اختیاری، یکی از: `price-asc`, `price-desc`, `newest`, `oldest`, `popular`)
  - `featured` (اختیاری، فقط محصولات ویژه)
  - Params: ندارد | Auth: عمومی

- `GET /api/v1/orders` — لیست سفارش‌های کاربر با pagination/فیلتر | Query:
  - `page` (اختیاری، پیش‌فرض: `1`)
  - `limit` (اختیاری، پیش‌فرض: `20`)
  - `status` (اختیاری، از `OrderStatus`)
  - `paymentStatus` (اختیاری، از `PaymentStatus`)
  - Params: ندارد | Auth: محافظت‌شده (JWT)

- `GET /api/v1/orders/admin` — همه سفارش‌ها (فقط ادمین) با pagination/فیلتر | Query:
  - `page` (اختیاری، پیش‌فرض: `1`)
  - `limit` (اختیاری، پیش‌فرض: `20`)
  - `status` (اختیاری، از `OrderStatus`)
  - `paymentStatus` (اختیاری، از `PaymentStatus`)
  - Params: ندارد | Auth: محافظت‌شده (JWT + ادمین)

- `GET /api/v1/reviews` — همه نظرات (فقط ادمین) با pagination/فیلتر تایید | Query:
  - `page` (اختیاری، پیش‌فرض: `1`)
  - `limit` (اختیاری، پیش‌فرض: `20`)
  - `approved` (اختیاری، boolean با تبدیل `true/false`)
  - Params: ندارد | Auth: محافظت‌شده (JWT + ادمین)

- `GET /api/v1/users` — لیست کاربران (فقط ادمین) با pagination | Query:
  - `page` (اختیاری، پیش‌فرض: `1`)
  - `limit` (اختیاری، پیش‌فرض: `20`)
  - Params: ندارد | Auth: محافظت‌شده (JWT + ادمین)

- `GET /api/v1/checkout/verify` — callback پرداخت | Query:
  - `Authority` (string، معمولاً لازم)
  - `Status` (string، معمولاً لازم)
  - Params: ندارد | Auth: عمومی

