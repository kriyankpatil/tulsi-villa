const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...');
    
    // Clear all data from tables in the correct order (respecting foreign key constraints)
    
    // 1. Clear Sessions first (depends on User)
    console.log('📝 Clearing Sessions...');
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} sessions`);
    
    // 2. Clear Receipts (depends on User)
    console.log('🧾 Clearing Receipts...');
    const deletedReceipts = await prisma.receipt.deleteMany({});
    console.log(`✅ Deleted ${deletedReceipts.count} receipts`);
    
    // 3. Clear Expenses
    console.log('💰 Clearing Expenses...');
    const deletedExpenses = await prisma.expense.deleteMany({});
    console.log(`✅ Deleted ${deletedExpenses.count} expenses`);
    
    // 4. Clear Users (this will also clear related sessions and receipts)
    console.log('👥 Clearing Users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);
    
    // 5. Reset AdminBalances to default values
    console.log('⚖️  Resetting Admin Balances...');
    await prisma.adminBalances.upsert({
      where: { id: 1 },
      update: {
        receivedAdjustmentPaise: 0,
        expenseAdjustmentPaise: 0,
      },
      create: {
        id: 1,
        receivedAdjustmentPaise: 0,
        expenseAdjustmentPaise: 0,
      },
    });
    console.log('✅ Admin balances reset to zero');
    
    // 6. Reset auto-increment counters (optional - only if you want fresh IDs)
    console.log('🔄 Resetting auto-increment counters...');
    
    // Note: PostgreSQL doesn't have a direct way to reset sequences via Prisma
    // You can run this SQL manually in Supabase if needed:
    // ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
    // ALTER SEQUENCE "Receipt_id_seq" RESTART WITH 1;
    // ALTER SEQUENCE "Expense_id_seq" RESTART WITH 1;
    // ALTER SEQUENCE "Session_id_seq" RESTART WITH 1;
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('');
    console.log('📋 Summary of cleared data:');
    console.log(`   - Sessions: ${deletedSessions.count}`);
    console.log(`   - Receipts: ${deletedReceipts.count}`);
    console.log(`   - Expenses: ${deletedExpenses.count}`);
    console.log(`   - Users: ${deletedUsers.count}`);
    console.log('   - Admin Balances: Reset to zero');
    console.log('');
    console.log('🎯 Your database is now clean and ready for new users!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDatabase()
  .then(() => {
    console.log('🚀 Database cleanup script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database cleanup failed:', error);
    process.exit(1);
  });
