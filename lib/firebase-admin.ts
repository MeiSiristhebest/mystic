import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.info('Firebase Admin credentials not provided, running in local-only / offline mode');
    }
  } catch (error) {
    console.warn('Firebase Admin initialization skipped / error:', error);
  }
}

if (admin.apps.length > 0) {
  try {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
  } catch (e) {
    console.warn('Firebase Admin services setup failed:', e);
  }
}

export { adminDb, adminAuth };
