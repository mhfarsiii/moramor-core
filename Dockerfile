# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma/
RUN  npm install --prefer-offline
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# نصب پکیج‌ها برای پروداکشن
RUN npm ci --omit=dev

# نکته حیاتی DevOps: تولید مجدد کلاینت پریزما برای دسترسی در Stage 2
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./dist/templates

EXPOSE 3000
CMD ["node", "dist/main.js"]
