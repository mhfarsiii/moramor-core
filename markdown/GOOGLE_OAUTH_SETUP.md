# راهنمای کامل راه‌اندازی ورود با Google OAuth

> **📘 توجه**: برای راهنمای کامل جریان احراز هویت و پیاده‌سازی Frontend، [GOOGLE_OAUTH_FLOW.md](./GOOGLE_OAUTH_FLOW.md) را مطالعه کنید.

## ✅ کارهای انجام شده

1. ✅ Client ID و Client Secret به فایل `env.template` اضافه شد
2. ✅ Client ID و Client Secret به فایل `.env` اضافه شد
3. ✅ Google OAuth Strategy در کد پیاده‌سازی شده است
4. ✅ Endpoints مربوط به Google OAuth آماده است
5. ✅ Redirect به Frontend با توکن‌ها پیاده‌سازی شد

## 🔧 مراحل نهایی در Google Cloud Console

برای اینکه ورود با Gmail کاملاً کار کند، باید تنظیمات زیر را در Google Cloud Console انجام دهید:

### 1. ورود به Google Cloud Console

1. به [Google Cloud Console](https://console.cloud.google.com/) بروید
2. پروژه خود را انتخاب کنید (یا یک پروژه جدید بسازید)

### 2. فعال‌سازی Google+ API

1. به **APIs & Services** > **Library** بروید
2. **Google+ API** را جستجو کنید
3. روی **Enable** کلیک کنید

### 3. تنظیم OAuth Consent Screen

1. به **APIs & Services** > **OAuth consent screen** بروید
2. نوع اپلیکیشن را انتخاب کنید (External یا Internal)
3. اطلاعات زیر را پر کنید:
   - **App name**: Moramor Store (یا نام دلخواه)
   - **User support email**: ایمیل شما
   - **Developer contact information**: ایمیل شما
4. روی **Save and Continue** کلیک کنید
5. در بخش **Scopes**، scope های زیر را اضافه کنید:
   - `email`
   - `profile`
   - `openid`
6. روی **Save and Continue** کلیک کنید
7. در بخش **Test users** (اگر External است)، می‌توانید ایمیل‌های تست اضافه کنید
8. روی **Save and Continue** کلیک کنید

### 4. تنظیم Authorized Redirect URIs

1. به **APIs & Services** > **Credentials** بروید
2. روی OAuth 2.0 Client ID خود کلیک کنید (یا یک Client ID جدید بسازید)
3. در بخش **Authorized redirect URIs**، URL زیر را اضافه کنید:

   ```
   http://localhost:3000/api/v1/auth/google/callback
   ```

   **برای Production:**
   ```
   https://yourdomain.com/api/v1/auth/google/callback
   ```

4. روی **Save** کلیک کنید

### 5. بررسی Client ID و Client Secret

مطمئن شوید که:
- **Client ID** در Google Cloud Console با Client ID در فایل `.env` یکسان است
- **Client Secret** در Google Cloud Console با Client Secret در فایل `.env` یکسان است

## 🚀 تست ورود با Google

### 1. راه‌اندازی سرور

```bash
# اطمینان حاصل کنید که دیتابیس و Redis در حال اجرا هستند
docker-compose -f docker-compose.dev.yml up -d

# راه‌اندازی سرور
npm run start:dev
```

### 2. تست از طریق مرورگر

1. مرورگر را باز کنید
2. به آدرس زیر بروید:

   ```
   http://localhost:3000/api/v1/auth/google
   ```

3. باید به صفحه ورود Google هدایت شوید
4. با حساب Google خود وارد شوید
5. بعد از تأیید، به callback URL برگردانده می‌شوید
6. باید یک JSON response با اطلاعات زیر دریافت کنید:

   ```json
   {
     "user": {
       "id": "...",
       "email": "your-email@gmail.com",
       "name": "Your Name",
       "role": "USER",
       "emailVerified": true,
       "googleId": "..."
     },
     "accessToken": "...",
     "refreshToken": "..."
   }
   ```

### 3. تست از طریق Swagger

1. به آدرس زیر بروید:

   ```
   http://localhost:3000/api-docs
   ```

2. بخش **Auth** را پیدا کنید
3. روی `GET /auth/google` کلیک کنید
4. روی **Try it out** کلیک کنید
5. روی **Execute** کلیک کنید
6. باید به صفحه ورود Google هدایت شوید

### 4. تست از طریق Postman یا cURL

```bash
# شروع OAuth flow
curl -L http://localhost:3000/api/v1/auth/google
```

یا در Postman:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/auth/google`
- Follow redirects را فعال کنید

## 📝 نکات مهم

### 1. Callback URL

- در **Development**: `http://localhost:3000/api/v1/auth/google/callback`
- در **Production**: باید URL کامل دامنه خود را استفاده کنید
- حتماً این URL را در Google Cloud Console اضافه کنید

### 2. Scopes

کد فعلی از scope های زیر استفاده می‌کند:
- `email`: برای دریافت ایمیل کاربر
- `profile`: برای دریافت اطلاعات پروفایل

این scope ها در فایل `google.strategy.ts` تنظیم شده‌اند.

### 3. امنیت

- **هرگز** Client Secret را در کد یا repository قرار ندهید
- فایل `.env` باید در `.gitignore` باشد
- در Production از HTTPS استفاده کنید

### 4. خطاهای رایج

#### خطا: "redirect_uri_mismatch"
- **علت**: Callback URL در Google Cloud Console با URL در کد یکسان نیست
- **راه حل**: Callback URL را در Google Cloud Console بررسی کنید

#### خطا: "invalid_client"
- **علت**: Client ID یا Client Secret اشتباه است
- **راه حل**: مقادیر را در `.env` و Google Cloud Console بررسی کنید

#### خطا: "access_denied"
- **علت**: کاربر دسترسی را رد کرده است
- **راه حل**: کاربر باید دسترسی را تأیید کند

## 🔄 Flow کامل OAuth

1. کاربر روی دکمه "ورود با Google" کلیک می‌کند
2. درخواست به `GET /api/v1/auth/google` ارسال می‌شود
3. کاربر به صفحه ورود Google هدایت می‌شود
4. کاربر با حساب Google خود وارد می‌شود
5. Google کاربر را به `GET /api/v1/auth/google/callback` برمی‌گرداند
6. سیستم اطلاعات کاربر را از Google دریافت می‌کند
7. اگر کاربر جدید است، حساب کاربری ایجاد می‌شود
8. اگر کاربر قبلاً ثبت‌نام کرده، حساب Google به حساب موجود لینک می‌شود
9. JWT Token تولید و به کاربر برگردانده می‌شود

## 📚 مستندات بیشتر

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)

## ✅ چک‌لیست نهایی

قبل از استفاده در Production، مطمئن شوید:

- [ ] Client ID و Client Secret در `.env` تنظیم شده‌اند
- [ ] Callback URL در Google Cloud Console اضافه شده است
- [ ] OAuth Consent Screen تنظیم شده است
- [ ] Google+ API فعال است
- [ ] در Production از HTTPS استفاده می‌کنید
- [ ] Callback URL در Production به درستی تنظیم شده است
- [ ] تست‌ها با موفقیت انجام شده‌اند

---

**موفق باشید! 🎉**

