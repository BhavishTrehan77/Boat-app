import { Storage } from "@google-cloud/storage";

function getStorageInstance() {
  const storageOptions = {};

  if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
    storageOptions.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    storageOptions.credentials = {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS.trim();
    if (creds.startsWith("{")) {
      try {
        const parsed = JSON.parse(creds);
        if (parsed.private_key) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
        }
        storageOptions.credentials = parsed;
      } catch (e) {
        console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS JSON:", e.message);
      }
    } else {
      storageOptions.keyFilename = creds;
    }
  }

  return new Storage(storageOptions);
}

export function getBucket() {
  const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
  if (!bucketName) {
    throw new Error(
      "GCS Error: GOOGLE_CLOUD_BUCKET_NAME is not set in environment variables (.env / .env.local)."
    );
  }
  const storage = getStorageInstance();
  return storage.bucket(bucketName);
}

const bucket = {
  file(fileName) {
    return getBucket().file(fileName);
  },
};

export default bucket;



