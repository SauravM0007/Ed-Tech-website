const cloudinary = require("cloudinary").v2; //! Cloudinary is being required
require("dotenv").config();

exports.cloudinaryConnect = () => {
  try {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config(process.env.CLOUDINARY_URL);
      console.log("Cloudinary configured from CLOUDINARY_URL");
      return;
    }

    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.warn(
        "Cloudinary credentials missing. File uploads will use local storage."
      );
      return;
    }

    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });
    console.log("Cloudinary configured successfully");
  } catch (error) {
    console.error("Cloudinary configuration error:", error.message);
  }
};
