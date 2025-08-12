import admin from 'firebase-admin';

// This guard prevents re-initialization in hot-reload environments
if (!admin.apps.length) {
  // Check if the service account key is available in environment variables
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables. Please add it to your .env file.');
  }

  // Parse the service account key from the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export the initialized admin services for use in other server-side files
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminMessaging = admin.messaging();

export default admin;
