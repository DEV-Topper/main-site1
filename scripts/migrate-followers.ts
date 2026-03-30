import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migratePurchases() {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Get purchases and accounts collections
    const purchasesCollection = db.collection('purchases');
    const accountsCollection = db.collection('accounts');

    // Find all purchases without followers or with followers = 0
    const purchases = await purchasesCollection
      .find({ $or: [{ followers: { $exists: false } }, { followers: 0 }] })
      .toArray();

    console.log(`📊 Found ${purchases.length} purchases to update`);

    let updatedCount = 0;

    for (const purchase of purchases) {
      if (purchase.accountId) {
        // Find the account
        const account = await accountsCollection.findOne({
          _id: new mongoose.Types.ObjectId(purchase.accountId),
        });

        if (account && account.followers) {
          // Update purchase with followers
          await purchasesCollection.updateOne(
            { _id: purchase._id },
            { $set: { followers: account.followers } }
          );
          console.log(
            `✅ Purchase ${purchase._id}: Set followers to ${account.followers}`
          );
          updatedCount++;
        } else {
          // No account found, set to 0
          await purchasesCollection.updateOne(
            { _id: purchase._id },
            { $set: { followers: 0 } }
          );
          console.log(`⚠️  Purchase ${purchase._id}: Account not found, set followers to 0`);
        }
      } else {
        // No accountId, set to 0
        await purchasesCollection.updateOne(
          { _id: purchase._id },
          { $set: { followers: 0 } }
        );
        console.log(`⚠️  Purchase ${purchase._id}: No accountId, set followers to 0`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} purchases`);
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePurchases();
