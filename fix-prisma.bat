@echo off
echo Fixing Prisma TypeScript issues...

echo Step 1: Generating Prisma client with new schema...
npx prisma generate

echo Step 2: Running database migration...
npx prisma db push

echo Step 3: Checking Prisma client generation...
npx prisma validate

echo Prisma fixes completed!
pause
