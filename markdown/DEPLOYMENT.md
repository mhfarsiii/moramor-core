# 📦 راهنمای استقرار (Deployment Guide)

این سند راهنمای کامل استقرار بک‌اند Moramor در محیط‌های مختلف را شامل می‌شود.

## فهرست

1. [استقرار محلی با Docker](#استقرار-محلی-با-docker)
2. [استقرار در VPS (Ubuntu/Debian)](#استقرار-در-vps)
3. [استقرار در AWS](#استقرار-در-aws)
4. [استقرار در Heroku](#استقرار-در-heroku)
5. [تنظیمات امنیتی](#تنظیمات-امنیتی)
6. [مانیتورینگ](#مانیتورینگ)

## استقرار محلی با Docker

### پیش‌نیازها
- Docker >= 20.10
- Docker Compose >= 2.0

### مراحل

```bash
# 1. کلون پروژه
git clone https://github.com/your-username/moramor-core.git
cd moramor-core

# 2. تنظیم environment
cp env.template .env
# ویرایش .env

# 3. راه‌اندازی
docker-compose up -d

# 4. اجرای migrations
docker-compose exec app npx prisma migrate deploy

# 5. Seed کردن دیتا (اختیاری)
docker-compose exec app npm run prisma:seed

# 6. بررسی وضعیت
docker-compose ps
```

## استقرار در VPS

### پیش‌نیازها

سرور Ubuntu 22.04 یا Debian 11 با:
- حداقل 2GB RAM
- 20GB Storage
- دسترسی SSH

### 1. آماده‌سازی سرور

```bash
# اتصال به سرور
ssh user@your-server-ip

# به‌روزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب dependencies
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# نصب Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# نصب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# نصب Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. کلون و تنظیم پروژه

```bash
# ایجاد دایرکتوری
sudo mkdir -p /opt/moramor-backend
sudo chown $USER:$USER /opt/moramor-backend
cd /opt/moramor-backend

# کلون پروژه
git clone https://github.com/your-username/moramor-core.git .

# تنظیم environment
cp env.template .env
nano .env  # ویرایش و تنظیم مقادیر
```

### 3. تنظیم SSL با Certbot

```bash
# دریافت SSL certificate
sudo certbot --nginx -d api.moramor.com

# تست auto-renewal
sudo certbot renew --dry-run
```

### 4. تنظیم Nginx

```bash
# کپی config
sudo cp nginx.conf /etc/nginx/sites-available/moramor
sudo ln -s /etc/nginx/sites-available/moramor /etc/nginx/sites-enabled/

# تست config
sudo nginx -t

# راه‌اندازی مجدد
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. راه‌اندازی با Docker Compose

```bash
# Build و اجرا
docker-compose up -d

# بررسی logs
docker-compose logs -f app

# اجرای migrations
docker-compose exec app npx prisma migrate deploy
```

### 6. تنظیم Systemd Service (اختیاری)

اگر بدون Docker اجرا می‌کنید:

```bash
# ایجاد service file
sudo nano /etc/systemd/system/moramor.service
```

محتوا:

```ini
[Unit]
Description=Moramor Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=moramor
WorkingDirectory=/opt/moramor-backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# فعال‌سازی و اجرا
sudo systemctl daemon-reload
sudo systemctl enable moramor
sudo systemctl start moramor
sudo systemctl status moramor
```

## استقرار در AWS

### استفاده از EC2 + RDS

1. **ایجاد RDS Instance (PostgreSQL)**

```bash
# از AWS Console:
- Database: PostgreSQL 15
- Instance class: db.t3.micro (یا بالاتر)
- Storage: 20GB
- Public access: No
- VPC security group: تنظیم برای دسترسی از EC2
```

2. **ایجاد EC2 Instance**

```bash
# از AWS Console:
- AMI: Ubuntu 22.04
- Instance type: t3.small (یا بالاتر)
- Security group: 
  - SSH (22) از IP شما
  - HTTP (80) از همه جا
  - HTTPS (443) از همه جا
  - 3000 از لود بالانسر (اختیاری)
```

3. **تنظیم S3 برای فایل‌ها**

```bash
# ایجاد S3 bucket
aws s3 mb s3://moramor-products

# تنظیم permissions (public read)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::moramor-products/*"
    }
  ]
}
```

4. **استقرار**

روی EC2 instance مراحل [استقرار در VPS](#استقرار-در-vps) را دنبال کنید.

## استقرار در Heroku

### 1. آماده‌سازی

```bash
# نصب Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# ورود
heroku login
```

### 2. ایجاد App

```bash
# ایجاد app
heroku create moramor-backend

# اضافه کردن PostgreSQL
heroku addons:create heroku-postgresql:mini

# تنظیم environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
# ... سایر متغیرها
```

### 3. Deploy

```bash
# Push به Heroku
git push heroku main

# اجرای migrations
heroku run npx prisma migrate deploy

# Seed (اختیاری)
heroku run npm run prisma:seed

# مشاهده logs
heroku logs --tail
```

## تنظیمات امنیتی

### 1. Firewall (UFW)

```bash
# فعال‌سازی
sudo ufw enable

# تنظیم قوانین
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 3000/tcp  # بستن port مستقیم app

# بررسی
sudo ufw status
```

### 2. تنظیم PostgreSQL

```bash
# ویرایش pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# فقط از localhost اجازه دهید
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

### 3. Secrets Management

استفاده از vault یا secrets manager:

```bash
# نصب Docker Secrets
docker swarm init
echo "my-secret-value" | docker secret create jwt_secret -

# استفاده در docker-compose
secrets:
  jwt_secret:
    external: true
```

### 4. Rate Limiting

در nginx.conf قبلاً تنظیم شده است. برای تنظیمات بیشتر:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req zone=api burst=20 nodelay;
```

## مانیتورینگ

### 1. Application Monitoring

```bash
# نصب PM2
npm install -g pm2

# اجرا با PM2
pm2 start dist/main.js --name moramor-api

# مانیتورینگ
pm2 monit
pm2 logs moramor-api

# Auto-restart
pm2 startup
pm2 save
```

### 2. Server Monitoring

```bash
# نصب htop
sudo apt install htop

# نصب Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*
./node_exporter &
```

### 3. Database Monitoring

```bash
# PostgreSQL monitoring
sudo apt install postgresql-contrib
sudo -u postgres psql
\x
SELECT * FROM pg_stat_activity;
```

### 4. Error Tracking

پروژه آماده یکپارچه‌سازی با Sentry است:

```bash
# تنظیم Sentry DSN در .env
SENTRY_DSN=your-sentry-dsn
```

### 5. Logs

```bash
# Docker logs
docker-compose logs -f --tail=100 app

# Application logs (با Winston)
tail -f logs/error.log
tail -f logs/combined.log
```

## بکاپ و Restore

### بکاپ دیتابیس

```bash
# بکاپ دستی
docker-compose exec postgres pg_dump -U moramor moramor_db > backup_$(date +%Y%m%d).sql

# بکاپ خودکار (crontab)
0 2 * * * cd /opt/moramor-backend && docker-compose exec -T postgres pg_dump -U moramor moramor_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Restore

```bash
# Restore از بکاپ
cat backup_20250113.sql | docker-compose exec -T postgres psql -U moramor moramor_db
```

## عیب‌یابی

### 1. اپلیکیشن اجرا نمی‌شود

```bash
# بررسی logs
docker-compose logs app

# بررسی environment
docker-compose exec app env

# بررسی database connection
docker-compose exec app npx prisma db pull
```

### 2. مشکل در پرداخت

```bash
# بررسی ZarinPal config
# اطمینان از صحت ZARINPAL_MERCHANT_ID
# FRONTEND_URL باید به دامنه فرانت‌اند اشاره کند (callback: {FRONTEND_URL}/checkout/verify)
# ZARINPAL_CALLBACK_URL اختیاری است؛ در صورت تنظیم باید همان URL فرانت‌اند باشد، نه API بک‌اند
```

### 3. مشکل در آپلود فایل

```bash
# بررسی MinIO/S3
docker-compose logs minio

# تست اتصال
curl http://localhost:9000/minio/health/live
```

---

برای سوالات بیشتر، به [Issues](https://github.com/your-username/moramor-core/issues) مراجعه کنید.

