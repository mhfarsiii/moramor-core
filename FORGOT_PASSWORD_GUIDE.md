# راهنمای قابلیت فراموشی رمز عبور

## بررسی کلی

این قابلیت به کاربران امکان بازیابی رمز عبور خود را از طریق ایمیل می‌دهد. کاربران می‌توانند با وارد کردن ایمیل خود، لینک بازیابی رمز عبور را دریافت کنند.

## ویژگی‌های امنیتی

- ✅ **امنیت در برابر Email Enumeration**: همیشه پیام موفقیت ارسال می‌شود
- ✅ **توکن‌های منقضی شونده**: توکن‌ها پس از ۱ ساعت منقضی می‌شوند
- ✅ **یکبار مصرف**: هر توکن فقط یکبار قابل استفاده است
- ✅ **پاکسازی خودکار**: توکن‌های منقضی شده خودکار پاک می‌شوند
- ✅ **حذف Session**: پس از تغییر رمز عبور، تمام session‌ها باطل می‌شوند
- ✅ **Rate Limiting**: محدودیت در تعداد درخواست‌ها

## API Endpoints

### 1. درخواست بازیابی رمز عبور

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**پاسخ موفق:**
```json
{
  "message": "اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد"
}
```

### 2. بازیابی رمز عبور

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456ghi789",
  "newPassword": "newPassword123"
}
```

**پاسخ موفق:**
```json
{
  "message": "رمز عبور با موفقیت تغییر کرد"
}
```

## تنظیمات محیطی

در فایل `.env` متغیرهای زیر را تنظیم کنید:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM_NAME=Moramor Store
FRONTEND_URL=http://localhost:3000
```

### تنظیم Gmail

1. **فعال‌سازی 2FA**: ابتدا Two-Factor Authentication را در Gmail فعال کنید
2. **ایجاد App Password**: 
   - به Google Account Settings بروید
   - Security > 2-Step Verification > App passwords
   - یک App Password جدید ایجاد کنید
   - این رمز را در `MAIL_PASS` قرار دهید

## فایل‌های ایجاد شده

### DTOs
- `src/modules/auth/dto/forgot-password.dto.ts`
- `src/modules/auth/dto/reset-password.dto.ts`

### Services
- `src/modules/auth/mail.service.ts`

### Templates
- `src/templates/password-reset.hbs`
- `src/templates/welcome.hbs`
- `src/templates/email-verification.hbs`

### Database
- جدول `password_reset_tokens` در Prisma schema

## جریان کار (Workflow)

1. **درخواست بازیابی**: کاربر ایمیل خود را وارد می‌کند
2. **بررسی امنیتی**: سیستم بررسی می‌کند که کاربر وجود دارد و رمز عبور دارد
3. **ایجاد توکن**: یک توکن منحصر به فرد و منقضی شونده ایجاد می‌شود
4. **ارسال ایمیل**: ایمیل با لینک بازیابی ارسال می‌شود
5. **بازیابی رمز**: کاربر روی لینک کلیک کرده و رمز عبور جدید وارد می‌کند
6. **تأیید و پاکسازی**: رمز عبور تغییر کرده و تمام session‌ها باطل می‌شوند

## تست کردن

### 1. تست درخواست بازیابی

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. تست بازیابی رمز عبور

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your-reset-token", "newPassword": "newPassword123"}'
```

## نکات مهم

### امنیت
- هرگز اطلاعات حساس را در لاگ‌ها ذخیره نکنید
- از HTTPS در production استفاده کنید
- Rate limiting را فعال نگه دارید

### عملکرد
- توکن‌های منقضی شده را به صورت دوره‌ای پاک کنید
- از connection pooling برای دیتابیس استفاده کنید
- Cache کردن را برای بهبود عملکرد در نظر بگیرید

### پشتیبانی
- ایمیل‌ها را در صف قرار دهید تا در صورت خرابی سرور ایمیل، درخواست‌ها از دست نروند
- لاگ‌های کامل برای debugging نگه دارید
- Monitoring برای تعداد درخواست‌های بازیابی رمز عبور

## عیب‌یابی

### مشکلات رایج

1. **ایمیل ارسال نمی‌شود**:
   - بررسی تنظیمات SMTP
   - بررسی App Password Gmail
   - بررسی فایروال و پورت‌ها

2. **توکن نامعتبر**:
   - بررسی انقضای توکن
   - بررسی صحت کپی کردن توکن
   - بررسی وجود توکن در دیتابیس

3. **خطای دیتابیس**:
   - بررسی اتصال دیتابیس
   - اجرای migration‌ها
   - بررسی جدول password_reset_tokens

## توسعه آینده

- [ ] اضافه کردن کد تأیید ۶ رقمی
- [ ] پشتیبانی از SMS
- [ ] اضافه کردن CAPTCHA
- [ ] بهبود template‌های ایمیل
- [ ] اضافه کردن analytics
- [ ] پشتیبانی از چندین زبان
