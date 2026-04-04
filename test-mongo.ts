import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const vaSchema = new mongoose.Schema({}, { strict: false });
    const PaymentpointVirtualAccount = mongoose.models.PaymentpointVirtualAccount || mongoose.model("PaymentpointVirtualAccount", vaSchema);
    
    const va = await PaymentpointVirtualAccount.findOne().sort({ createdAt: -1 });
    console.log("Latest VA:", JSON.stringify(va));
    process.exit(0);
}
run();
