-- Phone-based auth: make phoneNumber the primary user identifier

-- Step 1: Add new columns with temporary defaults for existing rows
ALTER TABLE "users" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Backfill phoneNumber for existing users with dummy test values
UPDATE "users"
SET "phoneNumber" = '09' || LPAD(SUBSTRING(id FROM 1 FOR 9), 9, '0')
WHERE "phoneNumber" IS NULL;

-- Step 3: Make phoneNumber required and unique
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- Step 4: Make email optional (keep unique when present)
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Step 5: Drop old phone column if it exists (was optional secondary field)
ALTER TABLE "users" DROP COLUMN IF EXISTS "phone";

-- Step 6: Add index on phoneNumber
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- Step 7: Update otp_codes table
ALTER TABLE "otp_codes" RENAME COLUMN "email" TO "phoneNumber";

-- Step 8: Recreate otp_codes index
DROP INDEX IF EXISTS "otp_codes_email_idx";
CREATE INDEX "otp_codes_phoneNumber_idx" ON "otp_codes"("phoneNumber");
