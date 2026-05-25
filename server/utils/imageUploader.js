const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const UPLOAD_ROOT = path.join(__dirname, "../uploads");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUD_NAME?.trim() &&
      process.env.API_KEY?.trim() &&
      process.env.API_SECRET?.trim()
  );

const uploadToLocal = (file, folder) => {
  const safeFolder = (folder || "StudyNotion").replace(/[^a-zA-Z0-9_-]/g, "");
  const uploadPath = path.join(UPLOAD_ROOT, safeFolder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const destination = path.join(uploadPath, filename);

  fs.copyFileSync(file.tempFilePath, destination);

  const baseUrl = process.env.BASE_URL || "http://localhost:4000";
  const publicUrl = `${baseUrl}/uploads/${safeFolder}/${filename}`;

  return {
    secure_url: publicUrl,
    url: publicUrl,
    duration: 0,
    public_id: `${safeFolder}/${filename}`,
  };
};

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  if (!file?.tempFilePath) {
    throw new Error("No file provided for upload");
  }

  if (!isCloudinaryConfigured()) {
    console.warn(
      "Cloudinary is not configured. Using local file storage for uploads."
    );
    return uploadToLocal(file, folder);
  }

  const options = {
    folder: folder || "StudyNotion",
    resource_type: "auto",
  };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  try {
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    console.warn("Falling back to local file storage.");
    return uploadToLocal(file, folder);
  }
};
