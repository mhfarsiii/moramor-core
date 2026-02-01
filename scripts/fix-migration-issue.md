# Fixing Prisma Migration Issues

## Problem: Migration fails because schema elements already exist

If you encounter errors like:
```
ERROR: type "UserRole" already exists
```

This means the database schema already has some elements, but Prisma's migration tracking doesn't know about them.

## Solution 1: Use Idempotent Migration (Recommended)

The migration file has been updated to be idempotent for enum types. This means it will skip creation if the enum already exists.

**To apply:**
```bash
docker compose exec -T core npx prisma migrate deploy
```

## Solution 2: Mark Migration as Resolved

If the schema already fully exists and matches the migration, you can mark it as resolved:

```bash
# Inside Docker container
docker compose exec -T core npx prisma migrate resolve --applied 20250101000000_init

# Or use the helper script
./scripts/resolve-migration.sh 20250101000000_init
```

## Solution 3: Check Migration Status

First, check what migrations Prisma thinks are applied:

```bash
docker compose exec -T core npx prisma migrate status
```

This will show you which migrations are pending vs applied.

## Solution 4: Manual Database Check

If you need to verify what exists in the database:

```bash
docker compose exec -T db psql -U moramor_user -d moramor_db -c "\dT+ UserRole"
```

## For Production

In production, always prefer:
1. **Idempotent migrations** (already implemented for enums)
2. **Mark as resolved** if schema already matches
3. **Never reset migrations** in production

## Recovery Steps

If a migration fails partway through:

1. Check what was created:
   ```bash
   docker compose exec -T db psql -U moramor_user -d moramor_db -c "\dt"
   ```

2. If schema matches migration, mark as resolved:
   ```bash
   docker compose exec -T core npx prisma migrate resolve --applied <migration_name>
   ```

3. If schema is incomplete, manually fix and then mark as resolved, or rollback and reapply.




