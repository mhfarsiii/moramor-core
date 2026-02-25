# راهنمای جریان احراز هویت با OTP ایمیل

> **توجه:** Google OAuth در این نسخه غیرفعال شده است. تنها روش ورود و ثبت‌نام، استفاده از **OTP ایمیل** است.

## نمای کلی (Overview)

این راهنما نحوه عملکرد جریان احراز هویت با OTP ایمیل در سیستم Moramor Core را توضیح می‌دهد و راهنمای پیاده‌سازی frontend را ارائه می‌دهد.

## معماری (Architecture)

```
کاربر → Frontend → Backend → Email OTP → Backend → Frontend → کاربر با توکن‌های احراز هویت
```

## جریان احراز هویت (Authentication Flow)

### مرحله 1: ارسال کد به ایمیل
کاربر ایمیل خود را وارد می‌کند و درخواست ارسال کد می‌دهد:

```
POST https://your-api.com/api/v1/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Backend:
1. اگر کاربر وجود نداشته باشد، یک کاربر جدید می‌سازد
2. یک کد ۶ رقمی تولید می‌کند
3. کد را در دیتابیس ذخیره و به ایمیل کاربر ارسال می‌کند

### مرحله 2: تأیید کد و دریافت توکن‌ها

کاربر کد را در فرم وارد می‌کند:

```
POST https://your-api.com/api/v1/auth/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

Backend:
1. کد و ایمیل را اعتبارسنجی می‌کند
2. در صورت موفقیت، `emailVerified` را روی `true` می‌گذارد
3. توکن‌های JWT (access و refresh) تولید می‌کند
4. آبجکت کاربر و توکن‌ها را برمی‌گرداند:

```json
{
  "user": {
    "id": "clr123...",
    "email": "user@example.com",
    "name": "User",
    "role": "USER",
    "emailVerified": true
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "isNewUser": false
}
```

## پیاده‌سازی Frontend (نمونه‌ها)

### 1. صفحه ورود با OTP (React)

```javascript
import { useState } from 'react';
import axios from 'axios';

function OtpLoginPage() {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const sendCode = async () => {
    await axios.post('https://your-api.com/api/v1/auth/send-code', { email });
    setStep('code');
  };

  const verifyCode = async () => {
    const { data } = await axios.post('https://your-api.com/api/v1/auth/verify-code', {
      email,
      code,
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // redirect to dashboard...
  };

  return (
    <div>
      {step === 'email' ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل خود را وارد کنید"
          />
          <button onClick={sendCode}>ارسال کد</button>
        </>
      ) : (
        <>
          <p>کد ارسال شده به {email} را وارد کنید</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد ۶ رقمی"
          />
          <button onClick={verifyCode}>تأیید کد و ورود</button>
        </>
      )}
    </div>
  );
}
```

### 2. استفاده از توکن‌ها در API Calls

الگوی استفاده از accessToken/refreshToken مثل قبل است:

```javascript
const apiClient = axios.create({
  baseURL: 'https://your-api.com/api/v1',
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

## نکات امنیتی و تنظیمات

- حتماً SMTP و ارسال ایمیل را صحیح تنظیم کنید (مثلاً با Gmail App Password یا Mailtrap).
- از HTTPS در production استفاده کنید.
- زمان انقضا برای OTP (`OTP_CODE_EXPIRATION`) و توکن‌ها (`JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`) را در `.env` کنترل کنید.

## نتیجه‌گیری

با این پیاده‌سازی:
- ✅ کاربران فقط با ایمیل و OTP وارد می‌شوند
- ✅ نیازی به مدیریت پسورد در frontend نیست
- ✅ Google OAuth به طور کامل غیرفعال شده است
- ✅ جریان ورود برای وب و موبایل ساده و یکپارچه است
