import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    tags: [
      {
        name: { type: String, required: true },
        count: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
  try {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Access token generation failed");
  }
};

userSchema.methods.generateRefreshToken = function() {
  try {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Refresh token generation failed");
  }
};

userSchema.methods.updateTagPreferences = async function(newTags) {
  try {
    if (!this.tags) {
      this.tags = [];
    }

    const tagsToProcess = newTags.slice(0, 10);

    for (const tag of tagsToProcess) {
      const existingTagIndex = this.tags.findIndex((t) => t.name === tag);
      if (existingTagIndex !== -1) {
        this.tags[existingTagIndex].count++;
      } else {
        this.tags.push({
          name: tag,
          count: 1,
          timestamp: Date.now(),
        });
      }
    }

    const maxCount = Math.max(...this.tags.map((t) => t.count));
    if (maxCount > 100) {
      const scaleFactor = 100 / maxCount;
      this.tags.forEach((tag) => {
        tag.count = Math.max(1, Math.floor(tag.count * scaleFactor));
      });
    }

    this.tags.sort((a, b) => b.count - a.count);

    const finalTags = [];

    finalTags.push(...this.tags.slice(0, 4));

    const remainingTags = this.tags.slice(4);
    remainingTags.sort((a, b) => b.timestamp - a.timestamp);
    finalTags.push(...remainingTags.slice(0, 3));

    const leftoverTags = remainingTags.slice(3);
    leftoverTags.sort((a, b) => b.count - a.count);
    finalTags.push(...leftoverTags.slice(0, 3));

    this.tags = finalTags;

    await this.save();
    return this.tags;
  } catch (error) {
    console.error("Error updating tag preferences:", error);
    throw new Error("Failed to update tag preferences");
  }
};

export const User = mongoose.model("User", userSchema);
