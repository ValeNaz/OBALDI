-- Add password hash column for production login
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;
