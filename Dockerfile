# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# نصب ابزارهای مورد نیاز سیستم‌عامل
RUN apk add --no-cache openssl libc6-compat

# ۱. کپی فایل‌های پکیج و نصب دپندنسی‌ها
COPY package*.json ./
RUN npm ci

# ۲. کپی کردن کل پروژه (شامل پوشه src و prisma)
COPY . .

# ۳. تولید کلاینت پریزما (حتماً بعد از کپی شدن فایل schema.prisma)
RUN npx prisma generate

# ۴. اجرای بیلد (حالا تمام فایل‌های src/common موجود هستند)
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# کپی کردن خروجی‌ها از مرحله قبل
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]