# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
# نصب تمام پکیج‌ها برای بیلد
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Run (بسیار سبک)
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# فقط فایل‌های ضروری
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# نصب فقط پکیج‌های مورد نیاز اجرا (حذف devDependencies حجیم)
RUN npm ci --omit=dev

# کپی کردن خروجی بیلد
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./dist/templates

EXPOSE 3000
CMD ["node", "dist/main.js"]
