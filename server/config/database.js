const mongoose = require("mongoose");
require("dotenv").config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

exports.connect = () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URL)
      .then((mongooseInstance) => {
        console.log("DB Connected Successfully!");
        cached.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.log("DB Connection Failed");
        console.error(error);
        if (!process.env.VERCEL) {
          process.exit(1);
        }
        throw error;
      });
  }

  return cached.promise;
};
