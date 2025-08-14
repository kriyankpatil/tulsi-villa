# 🗑️ Database Cleanup Scripts

This directory contains scripts to clear all data from your Tulsi Villa database, making it ready for new users.

## 🚨 **WARNING: This will DELETE ALL DATA permanently!**

Make sure you have a backup if you need to recover any data later.

## 📋 **What Gets Cleared**

- **Users**: All member and admin accounts
- **Receipts**: All submitted receipts (pending, approved, rejected)
- **Expenses**: All recorded expenses
- **Sessions**: All user login sessions
- **Admin Balances**: Reset to zero

## 🛠️ **Method 1: Using Node.js Script (Recommended)**

### Prerequisites
- Make sure your `.env` file has the correct `DATABASE_URL`
- Ensure you're connected to the right database

### Run the script
```bash
npm run db:clear
```

This will:
1. Connect to your database using Prisma
2. Clear all data in the correct order
3. Reset admin balances to zero
4. Show a summary of what was deleted

## 🗄️ **Method 2: Direct SQL in Supabase**

### Steps
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `clear-database.sql`
4. Click **Run** to execute the script

### What the SQL script does
- Deletes all data from all tables
- Resets auto-increment counters
- Resets admin balances to zero
- Shows confirmation message

## 🔄 **Method 3: Manual Table Clearing**

If you prefer to clear tables one by one:

```sql
-- Clear sessions
DELETE FROM "Session";

-- Clear receipts  
DELETE FROM "Receipt";

-- Clear expenses
DELETE FROM "Expense";

-- Clear users
DELETE FROM "User";

-- Reset admin balances
UPDATE "AdminBalances" 
SET "receivedAdjustmentPaise" = 0, "expenseAdjustmentPaise" = 0, "updatedAt" = NOW()
WHERE id = 1;
```

## ✅ **After Cleanup**

Once the cleanup is complete:

1. **Verify**: Check that all tables are empty
2. **Test**: Try creating a new user account
3. **Deploy**: Your clean database is ready for new users!

## 🚨 **Important Notes**

- **Backup First**: Always backup your data before running cleanup scripts
- **Environment**: Make sure you're running against the correct database
- **Permissions**: Ensure your database user has DELETE permissions
- **Foreign Keys**: The scripts handle foreign key constraints properly

## 🆘 **Troubleshooting**

### If you get permission errors:
- Check your database user permissions
- Ensure you're connected to the right database
- Verify your `DATABASE_URL` is correct

### If tables don't exist:
- Run `npx prisma db push` to create tables first
- Check your Prisma schema matches your database

### If sequences don't reset:
- The SQL script handles this automatically
- You can manually reset sequences if needed

---

**Ready to clean your database? Choose the method that works best for you!** 🎯
