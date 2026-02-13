import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary with environment credentials.
 * Called once at module load time.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an avatar image to Cloudinary.
 *
 * Accepts a File from a multipart form submission, converts it to a
 * data URI, and uploads it to the `tweeter/avatars` folder with
 * automatic face-centered cropping.
 *
 * Returns the secure URL of the uploaded image.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "tweeter/avatars",
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" },
    ],
  });

  return result.secure_url;
}
