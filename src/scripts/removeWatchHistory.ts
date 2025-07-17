import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.ts";

dotenv.config();

const removeWatchHistory = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    const result = await mongoose.connection.db
      .collection("users")
      .updateMany(
        { watchHistory: { $exists: true } },
        { $unset: { watchHistory: "" } }
      );

    console.log("\n🧹 Migration Summary:");
    console.log(`→ Users matched: ${result.matchedCount}`);
    console.log(`→ Users modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

removeWatchHistory();
