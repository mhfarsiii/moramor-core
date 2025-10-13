# Changelog

تمام تغییرات مهم پروژه در این فایل ثبت می‌شود.

فرمت بر اساس [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) است.

## [1.0.0] - 2025-01-13

### Added

#### Core Features
- ✨ سیستم کامل احراز هویت با JWT و Refresh Token
- ✨ ورود با Google OAuth 2.0
- ✨ سیستم نقش‌های کاربری (User, Admin, Super Admin)
- ✨ CRUD کامل محصولات با فیلتر و جستجو
- ✨ دسته‌بندی محصولات با قابلیت سلسله‌مراتبی
- ✨ سبد خرید کامل با مدیریت موجودی
- ✨ سیستم سفارشات با وضعیت‌های مختلف
- ✨ تسویه‌حساب و پرداخت با درگاه زرین‌پال
- ✨ مدیریت آدرس‌های چندگانه کاربر
- ✨ لیست علاقه‌مندی‌ها (Wishlist)
- ✨ نظرات و امتیازدهی محصولات

#### Technical Features
- ✨ یکپارچه‌سازی با PostgreSQL و Prisma ORM
- ✨ آپلود و پردازش تصاویر با Sharp
- ✨ یکپارچه‌سازی با S3/MinIO
- ✨ Rate Limiting برای امنیت
- ✨ Validation با class-validator
- ✨ مستندات Swagger/OpenAPI کامل
- ✨ Docker و Docker Compose setup
- ✨ CI/CD با GitHub Actions
- ✨ Unit و Integration Tests
- ✨ Health Check endpoint

#### Security
- 🔒 Hash رمزعبور با bcrypt (salt 12)
- 🔒 Helmet برای امنیت headers
- 🔒 CORS configuration
- 🔒 HttpOnly Cookies
- 🔒 Rate limiting برای جلوگیری از abuse

#### Documentation
- 📚 README کامل
- 📚 راهنمای استقرار (DEPLOYMENT.md)
- 📚 راهنمای API (API_GUIDE.md)
- 📚 راهنمای مشارکت (CONTRIBUTING.md)
- 📚 Swagger documentation در `/api-docs`

### Database Schema
- 📊 User و RefreshToken
- 📊 Product و Category
- 📊 Cart و CartItem
- 📊 Order و OrderItem
- 📊 Address
- 📊 Wishlist
- 📊 Review

### Infrastructure
- 🐳 Docker images برای production
- 🐳 Docker Compose برای development
- 🔧 Nginx configuration
- 🔧 GitHub Actions workflows
- 🔧 Environment templates

## [Unreleased]

### Planned Features
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Elasticsearch integration for search
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Multi-language support
- [ ] Coupon/Discount codes system
- [ ] Inventory alerts
- [ ] Advanced reporting

### Known Issues
- MinIO bucket needs manual creation on first setup
- Refresh token rotation not implemented yet

---

**Legend:**
- ✨ Added
- 🔒 Security
- 📚 Documentation
- 📊 Database
- 🐳 DevOps
- 🔧 Configuration
- 🐛 Bug fix
- ⚡️ Performance
- 🎨 UI/UX

