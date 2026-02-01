# مرحله اول: Build
FROM node:22-alpine AS build-stage
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# مرحله دوم: Production
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# کپی کردن فایل‌ها از مرحله قبلی (نام مرحله باید دقیقاً یکی باشد)
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/prisma ./prisma

# نصب فقط ماژول‌های مورد نیاز اجرا
RUN npm ci --only=production

# کپی کردن کدهای کامپایل شده
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/src/templates ./dist/templates

EXPOSE 3000
CMD ["node", "dist/main.js"]
