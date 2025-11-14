# راهنمای رفع مشکل تأیید ایمیل و ورود

## 🔴 مشکل

وقتی کاربر ثبت‌نام می‌کند اما نمی‌تواند وارد شود (خطای 401)، معمولاً به این دلایل است:

1. **ایمیل تأیید ارسال نشده**: مشکل در تنظیمات Gmail SMTP
2. **ایمیل تأیید نشده**: کاربر باید ابتدا ایمیل خود را تأیید کند

## ✅ راه‌حل‌ها

### 1. رفع مشکل Gmail SMTP (راه‌حل اصلی)

خطای `530-5.7.0 Authentication Required` به این معنی است که Gmail نیاز به App Password دارد، نه رمز عبور عادی.

#### مراحل تنظیم Gmail App Password:

1. **فعال‌سازی 2-Step Verification**:
   - به [Google Account Security](https://myaccount.google.com/security) بروید
   - **2-Step Verification** را فعال کنید

2. **ساخت App Password**:
   - به [App Passwords](https://myaccount.google.com/apppasswords) بروید
   - روی **Select app** کلیک کنید و **Mail** را انتخاب کنید
   - روی **Select device** کلیک کنید و **Other (Custom name)** را انتخاب کنید
   - نام دلخواه وارد کنید (مثلاً: `Moramor Backend`)
   - روی **Generate** کلیک کنید
   - یک رمز 16 رقمی دریافت می‌کنید (مثلاً: `abcd efgh ijkl mnop`)

3. **تنظیم در فایل `.env`**:
   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=abcdefghijklmnop  # App Password (بدون فاصله)
   MAIL_FROM_NAME=Moramor Store
   FRONTEND_URL=http://localhost:3000
   ```

4. **راه‌اندازی مجدد سرور**:
   ```bash
   # توقف سرور (Ctrl+C)
   # راه‌اندازی مجدد
   npm run start:dev
   ```

### 2. استفاده از Endpoint ارسال مجدد ایمیل تأیید

اگر ایمیل تأیید ارسال نشده یا گم شده، می‌توانید از endpoint جدید استفاده کنید:

#### درخواست:
```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### پاسخ موفق:
```json
{
  "message": "اگر ایمیل در سیستم موجود باشد و تأیید نشده باشد، ایمیل تأیید ارسال شد"
}
```

#### مثال با cURL:
```bash
curl -X POST http://localhost:3000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "mhfarsi002022@gmail.com"}'
```

#### مثال با Postman:
- Method: `POST`
- URL: `http://localhost:3000/api/v1/auth/resend-verification`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "mhfarsi002022@gmail.com"
  }
  ```

### 3. تأیید ایمیل

بعد از دریافت ایمیل تأیید:

#### درخواست:
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### پاسخ موفق:
```json
{
  "message": "ایمیل شما با موفقیت تأیید شد"
}
```

### 4. ورود بعد از تأیید ایمیل

بعد از تأیید ایمیل، می‌توانید وارد شوید:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

## 🔧 راه‌حل موقت برای Development

اگر نمی‌خواهید Gmail را تنظیم کنید و فقط می‌خواهید تست کنید، می‌توانید:

### گزینه 1: تأیید دستی از طریق Database

```sql
-- تأیید دستی ایمیل کاربر
UPDATE users 
SET "emailVerified" = true 
WHERE email = 'mhfarsi002022@gmail.com';
```

### گزینه 2: استفاده از سرویس ایمیل دیگر

می‌توانید از سرویس‌های دیگری مثل:
- **Mailtrap** (برای تست)
- **SendGrid**
- **Mailgun**
- **Amazon SES**

تنظیمات در فایل `.env`:
```env
MAIL_HOST=smtp.mailtrap.io  # یا smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=your-username
MAIL_PASS=your-password
```

## 📋 چک‌لیست عیب‌یابی

- [ ] آیا `MAIL_USER` و `MAIL_PASS` در `.env` تنظیم شده‌اند؟
- [ ] آیا از App Password استفاده می‌کنید (نه رمز عبور عادی Gmail)؟
- [ ] آیا 2-Step Verification در Gmail فعال است؟
- [ ] آیا سرور را بعد از تغییر `.env` راه‌اندازی مجدد کرده‌اید؟
- [ ] آیا ایمیل در پوشه Spam بررسی شده است؟
- [ ] آیا از endpoint `resend-verification` استفاده کرده‌اید؟

## 🐛 خطاهای رایج

### خطا: `530-5.7.0 Authentication Required`
**علت**: استفاده از رمز عبور عادی به جای App Password  
**راه‌حل**: از App Password استفاده کنید (مراحل بالا)

### خطا: `Invalid login`
**علت**: App Password اشتباه است  
**راه‌حل**: App Password جدید بسازید و در `.env` قرار دهید

### خطا: `Email not verified` هنگام ورود
**علت**: ایمیل تأیید نشده است  
**راه‌حل**: 
1. از endpoint `resend-verification` استفاده کنید
2. یا از Database به صورت دستی تأیید کنید (فقط برای development)

## 📚 مستندات بیشتر

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [NestJS Mailer Module](https://github.com/nest-modules/mailer)
- [Email Verification Guide](./FORGOT_PASSWORD_GUIDE.md)

---

**نکته مهم**: در Production حتماً از App Password استفاده کنید و هرگز رمز عبور عادی Gmail را در کد قرار ندهید.

