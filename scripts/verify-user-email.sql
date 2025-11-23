-- اسکریپت تأیید دستی ایمیل کاربر
-- استفاده: این فایل را در psql یا pgAdmin اجرا کنید

-- تأیید ایمیل کاربر خاص
UPDATE users 
SET "emailVerified" = true 
WHERE email = 'mhfarsi002022@gmail.com';

-- بررسی نتیجه
SELECT id, email, name, "emailVerified", "isActive", "createdAt"
FROM users
WHERE email = 'mhfarsi002022@gmail.com';

-- برای تأیید همه کاربران تأیید نشده (فقط برای Development!)
-- ⚠️ هشدار: این دستور فقط برای محیط Development است!
-- UPDATE users SET "emailVerified" = true WHERE "emailVerified" = false;




