-- 🗑️ Tulsi Villa Database Cleanup Script
-- Run this in Supabase SQL Editor to clear all data

-- Disable foreign key checks temporarily (if needed)
-- SET session_replication_role = replica;

-- Clear all data from tables in the correct order
-- 1. Clear Sessions first (depends on User)
DELETE FROM "Session";
-- 2. Clear Receipts (depends on User)  
DELETE FROM "Receipt";
-- 3. Clear Expenses
DELETE FROM "Expense";
-- 4. Clear Users (this will also clear related sessions and receipts)
DELETE FROM "User";

-- Reset AdminBalances to default values
INSERT INTO "AdminBalances" (id, "receivedAdjustmentPaise", "expenseAdjustmentPaise", "updatedAt")
VALUES (1, 0, 0, NOW())
ON CONFLICT (id) 
DO UPDATE SET 
    "receivedAdjustmentPaise" = 0,
    "expenseAdjustmentPaise" = 0,
    "updatedAt" = NOW();

-- Reset auto-increment counters to start fresh
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Receipt_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Expense_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Session_id_seq" RESTART WITH 1;

-- Re-enable foreign key checks (if disabled above)
-- SET session_replication_role = DEFAULT;

-- Show confirmation
SELECT 
    'Database cleaned successfully!' as status,
    'All tables cleared and sequences reset' as details;
