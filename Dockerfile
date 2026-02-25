# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# نصب ابزارهای مورد نیاز سیستم‌عامل برای Prisma
RUN apk add --no-cache openssl libc6-compat

# اول فایل‌های تنظیمات رو کپی می‌کنیم (برای استفاده از کش لایه‌ها)
COPY package*.json ./
COPY prisma ./prisma/

# نصب تمام پکیج‌ها
RUN npm ci

# کپی کل کدها
COPY . .

# تولید کلاینت پریزما و بیلد پروژه
RUN npx prisma generate
RUN npm run build

# Stage 2: Run (نسخه نهایی و سبک برای سرور)
FROM node:22-alpine
WORKDIR /app

# نصب ابزارهای حداقلی برای اجرا
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# فقط فایل‌های ضروری برای اجرا رو کپی می‌کنیم
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# نصب فقط پکیج‌های مورد نیاز Production
RUN npm ci --omit=dev

# کپی کردن خروجی بیلد و تمپلیت‌ها طبق مسیر قبلی خودت
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./dist/templates

EXPOSE 3000

# اجرای برنامه از مسیری که قبلاً داشتی
CMD ["node", "dist/main.js"]
