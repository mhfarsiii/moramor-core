# راهنمای جریان احراز هویت Google OAuth

## نمای کلی (Overview)

این راهنما نحوه عملکرد جریان احراز هویت Google OAuth در سیستم Moramor Core را توضیح می‌دهد و راهنمای پیاده‌سازی frontend را ارائه می‌دهد.

## معماری (Architecture)

```
کاربر → Frontend → Backend → Google OAuth → Backend → Frontend → کاربر با توکن‌های احراز هویت
```

## جریان احراز هویت (Authentication Flow)

### مرحله 1: شروع احراز هویت
کاربر روی دکمه "ورود با Google" کلیک می‌کند و به URL زیر هدایت می‌شود:

```
GET https://your-api.com/api/v1/auth/google
```

### مرحله 2: تأیید Google
- کاربر به صفحه تأیید Google هدایت می‌شود
- کاربر حساب Google خود را انتخاب می‌کند
- Google دسترسی‌های درخواستی را نمایش می‌دهد
- کاربر دسترسی‌ها را تأیید می‌کند

### مرحله 3: Callback و Redirect
بعد از تأیید موفق، Google کاربر را به endpoint callback ما ارسال می‌کند:

```
GET https://your-api.com/api/v1/auth/google/callback
```

Backend:
1. اطلاعات کاربر را از Google دریافت می‌کند
2. کاربر را در دیتابیس ایجاد یا به‌روزرسانی می‌کند
3. توکن‌های JWT (access و refresh) تولید می‌کند
4. کاربر را به frontend با توکن‌ها redirect می‌کند:

```
https://your-frontend.com/auth/callback?accessToken=xxx&refreshToken=yyy&userId=zzz
```

## پیاده‌سازی Frontend

### 1. صفحه ورود (Login Page)

```javascript
// مثال با React
function LoginPage() {
  const handleGoogleLogin = () => {
    // Redirect به endpoint Google OAuth
    window.location.href = 'https://your-api.com/api/v1/auth/google';
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>
        ورود با Google
      </button>
    </div>
  );
}
```

### 2. صفحه Callback (Callback Handler)

ایجاد یک صفحه در مسیر `/auth/callback` که پارامترهای query را پردازش می‌کند:

```javascript
// React مثال با
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // دریافت توکن‌ها از URL
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');

    if (accessToken && refreshToken) {
      // ذخیره توکن‌ها
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', userId);

      // یا استفاده از state management (Redux, Zustand, etc.)
      // dispatch(setAuth({ accessToken, refreshToken, userId }));

      // هدایت به داشبورد
      navigate('/dashboard');
    } else {
      // هدایت به صفحه خطا
      navigate('/auth/error');
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <p>در حال ورود...</p>
    </div>
  );
}

export default AuthCallback;
```

### 3. مثال با Next.js

```typescript
// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();
  const { accessToken, refreshToken, userId } = router.query;

  useEffect(() => {
    if (accessToken && refreshToken) {
      // ذخیره توکن‌ها
      localStorage.setItem('accessToken', accessToken as string);
      localStorage.setItem('refreshToken', refreshToken as string);
      localStorage.setItem('userId', userId as string);

      // هدایت به داشبورد
      router.push('/dashboard');
    }
  }, [accessToken, refreshToken, userId, router]);

  return <div>در حال ورود...</div>;
}
```

### 4. مثال با Vue.js

```vue
<!-- src/views/AuthCallback.vue -->
<template>
  <div>
    <p>در حال ورود...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'AuthCallback',
  setup() {
    const route = useRoute();
    const router = useRouter();

    onMounted(() => {
      const { accessToken, refreshToken, userId } = route.query;

      if (accessToken && refreshToken) {
        // ذخیره توکن‌ها
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);

        // هدایت به داشبورد
        router.push('/dashboard');
      } else {
        router.push('/auth/error');
      }
    });
  },
};
</script>
```

### 5. استفاده از توکن‌ها در API Calls

```javascript
// API client configuration
const apiClient = axios.create({
  baseURL: 'https://your-api.com/api/v1',
});

// اضافه کردن interceptor برای افزودن توکن به همه درخواست‌ها
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// مدیریت refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'https://your-api.com/api/v1/auth/refresh',
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## صفحه خطا (Error Page)

ایجاد صفحه برای نمایش خطاهای احراز هویت:

```javascript
// React مثال با
import { useSearchParams } from 'react-router-dom';

function AuthError() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'خطا در احراز هویت';

  return (
    <div>
      <h1>خطا</h1>
      <p>{decodeURIComponent(message)}</p>
      <a href="/login">بازگشت به صفحه ورود</a>
    </div>
  );
}
```

## پیکربندی Environment Variables

در فایل `.env` خود:

```bash
# Backend URL
VITE_API_URL=https://your-api.com/api/v1
# یا
REACT_APP_API_URL=https://your-api.com/api/v1
# یا
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
```

## امنیت (Security Considerations)

### 1. ذخیره‌سازی توکن‌ها
- **localStorage**: ساده‌تر اما آسیب‌پذیرتر به XSS
- **sessionStorage**: فقط تا زمان بستن تب
- **Cookie (httpOnly)**: امن‌تر اما نیاز به پیاده‌سازی backend دارد
- **Memory State**: امن‌ترین اما از دست می‌رود با refresh

### 2. HTTPS
همیشه از HTTPS در production استفاده کنید

### 3. Token Expiration
- Access Token: 15 دقیقه (پیش‌فرض)
- Refresh Token: 7 روز (پیش‌فرض)

## تست کردن (Testing)

### تست در محیط Development

1. Backend را اجرا کنید:
```bash
cd moramor-core
npm run start:dev
```

2. مطمئن شوید متغیرهای محیطی تنظیم شده‌اند:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3001
```

3. Frontend را اجرا کنید و Google login را تست کنید

## رفع مشکلات رایج (Troubleshooting)

### مشکل: "JSON object is displayed instead of redirect"
**راه‌حل**: این مشکل حل شده است. Backend حالا به frontend redirect می‌کند.

### مشکل: "Redirect URL mismatch"
**راه‌حل**: مطمئن شوید `GOOGLE_CALLBACK_URL` در Google Console و `.env` یکسان هستند.

### مشکل: "Frontend URL is wrong"
**راه‌حل**: `FRONTEND_URL` را در `.env` backend چک کنید.

### مشکل: "Tokens are not being saved"
**راه‌حل**: مطمئن شوید صفحه `/auth/callback` در frontend صحیح پیاده‌سازی شده است.

## مثال کامل Frontend Route Configuration

### React Router

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Private Route Component

```javascript
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
```

## نتیجه‌گیری

با این پیاده‌سازی:
- ✅ کاربران می‌توانند با Google وارد شوند
- ✅ توکن‌ها به صورت امن به frontend ارسال می‌شوند
- ✅ Frontend می‌تواند توکن‌ها را ذخیره و استفاده کند
- ✅ خطاها به درستی مدیریت می‌شوند
- ✅ امنیت و بهترین روش‌ها رعایت شده‌اند

## منابع اضافی

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)




