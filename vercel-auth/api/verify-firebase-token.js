const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key}.`);
  }

  return value;
};

const getPrivateKey = () => getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

const initializeFirebaseAdmin = () => {
  if (getApps().length) {
    return;
  }

  initializeApp({
    credential: cert({
      projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getPrivateKey(),
    }),
  });
};

const getRequestBody = (request) => {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return request.body || {};
};

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Use POST." });
    return;
  }

  const expectedSecret = process.env.AUTH_FUNCTION_SECRET;
  if (!expectedSecret) {
    response.status(500).json({ error: "SERVER_ERROR", message: "Auth function secret is not configured." });
    return;
  }

  if (request.headers["x-internal-auth-secret"] !== expectedSecret) {
    response.status(403).json({ error: "FORBIDDEN", message: "Invalid function secret." });
    return;
  }

  let body;
  try {
    body = getRequestBody(request);
  } catch {
    response.status(400).json({ error: "BAD_REQUEST", message: "Invalid JSON body." });
    return;
  }

  const { idToken } = body;
  if (typeof idToken !== "string" || !idToken) {
    response.status(400).json({ error: "BAD_REQUEST", message: "Missing Firebase ID token." });
    return;
  }

  try {
    initializeFirebaseAdmin();
    const decoded = await getAuth().verifyIdToken(idToken);

    if (!decoded.uid || !decoded.email) {
      response.status(401).json({ error: "UNAUTHORIZED", message: "Firebase ID token is missing user claims." });
      return;
    }

    response.status(200).json({
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "",
        picture: decoded.picture || null,
        email_verified: decoded.email_verified || false,
      },
    });
  } catch (error) {
    console.error("[verify-firebase-token]", error);
    response.status(401).json({
      error: "UNAUTHORIZED",
      message: "Failed to verify Firebase ID token.",
    });
  }
};
