const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      indexedDB: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      indexedDB: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    birthday: {
      type: Date,
      required: false,
    },
    role: {
      type: String,
      enum: ["TEACHER", "STUDENT"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
