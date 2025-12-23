# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# نصب ابزارهای لازم برای پریزما
RUN apk add --no-cache openssl libc6-compat

# کپی فایل‌های پکیج
COPY package*.json ./

# نصب دپندنسی‌ها (در گیت‌هاب مستقیم از npm می‌گیرد)
RUN npm ci

# کپی کل کد و تولید کلاینت پریزما
COPY . .
RUN npx prisma generate

# بیلد نهایی پروژه
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# کپی فایل‌های لازم از مرحله بیلد
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]