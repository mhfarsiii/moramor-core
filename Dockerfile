# Stage 1: Build
FROM docker.arvancloud.ir/node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
# استفاده از آینه آروان برای سرعت بیلد در CI
RUN npm config set registry https://npm.mirror.arvancloud.ir && \
    npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Run
FROM docker.arvancloud.ir/node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# کپی کردن فقط موارد ضروری از مرحله بیلد
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]