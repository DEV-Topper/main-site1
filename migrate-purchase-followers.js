const mongoose = require('mongoose');

async function migratePurchases() {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      console.error('❌ MONGODB_URI not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const purchases = db.collection('purchases');
    const accounts = db.collection('accounts');

    // Find purchases without followers or with 0 followers
    const purchasesToUpdate = await purchases
      .find({
        $or: [
          { followers: { $exists: false } },
          { followers: 0 }
        ]
      })
      .toArray();

    console.log(`📊 Found ${purchasesToUpdate.length} purchases to update\n`);

    let updated = 0;
    for (const p of purchasesToUpdate) {
      if (p.accountId) {
        try {
          const acc = await accounts.findOne({
            _id: new mongoose.Types.ObjectId(p.accountId)
          });
          
          if (acc && acc.followers) {
            await purchases.updateOne(
              { _id: p._id },
              { $set: { followers: acc.followers } }
            );
            console.log(`✅ ${p._id.toString().slice(0, 8)}... → ${acc.followers} followers`);
            updated++;
          }
        } catch (e) {
          // ObjectId conversion failed, skip
        }
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} purchases`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migratePurchases();
