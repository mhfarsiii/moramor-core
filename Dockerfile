# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# به جای کپی کردن همه ماژول‌ها، فقط ماژول‌های Production را نصب می‌کنیم
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --only=production # فقط کتابخانه‌های لازم برای اجرا نصب می‌شوند

# کپی کردن خروجی بیلد
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./dist/templates

EXPOSE 3000
CMD ["node", "dist/main.js"]
