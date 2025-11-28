import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { Resend } from 'resend';
import { defineSecret } from 'firebase-functions/params';

admin.initializeApp();
const db = admin.firestore();

// Resend config
const resendApiKey = defineSecret('RESEND_API_KEY');

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Spør passord reset kode
export const requestPasswordResetCode = onCall({ region: "europe-west1", secrets: [resendApiKey], enforceAppCheck: false }, async (request) => { 
    const resend = new Resend(resendApiKey.value());
    // Request data  
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
      console.log(">>> VERSJON RESEND-FIX: STARTER NÅ <<<");

    if (!rawEmail) {
      throw new HttpsError("invalid-argument", "Mangler e-postadresse.");
    }

    let user;
    try {
      user = await admin.auth().getUserByEmail(rawEmail);
    } catch (error) {
      return { ok: true };
    }

    const code = generate4DigitCode();
    const now = Date.now();
    const expiresAt = new Date(now + CODE_TTL_MS);

    await db.collection("password_reset_codes").doc(user.uid).set({
        email: rawEmail,
        code: code,
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // send mail kode
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: 'Metricgains <support@metricgains.no>', // henter fra domenet
        to: [rawEmail],
        subject: 'Din verifikasjonskode',
        html: `<p>Gjennopprettingskoden din er: <strong>${code}</strong></p>`
      });

      if (error) console.error("Resend error:", error);
      else console.log("Resend success:", emailData);
      
    } catch (err) {
      console.error("Resend exception:", err);
    }

    return { ok: true };
});

// kode verifisering
export const verifyPasswordResetCode = onCall({ region: "europe-west1", enforceAppCheck: false }, async (request) => {
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
    const code = (data.code || "").toString().trim();

    if (!rawEmail || !code) {
        throw new HttpsError("invalid-argument", "Mangler e-post eller kode.");
    }

    const user = await admin.auth().getUserByEmail(rawEmail);
    const docRef = db.collection("password_reset_codes").doc(user.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new HttpsError("not-found", "Ingen kode funnet.");
    }

    const dataDb = docSnap.data();
    if (!dataDb || dataDb.code !== code) {
        await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        throw new HttpsError("invalid-argument", "Feil kode.");
    }

    if (dataDb.used) {
        throw new HttpsError("failed-precondition", "Koden er allerede brukt.");
    }

    if (dataDb.expiresAt.toDate().getTime() < Date.now()) {
        throw new HttpsError("deadline-exceeded", "Koden har utløpt.");
    }

    return { ok: true };
});

// reset passord kode
export const resetPasswordWithCode = onCall({ region: "europe-west1", enforceAppCheck: false }, async (request) => {
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
    const code = (data.code || "").toString().trim();
    const newPassword = (data.newPassword || "");

    if (!rawEmail || !code || !newPassword) {
        throw new HttpsError("invalid-argument", "Mangler info.");
    }

    const user = await admin.auth().getUserByEmail(rawEmail);
    const docRef = db.collection("password_reset_codes").doc(user.uid);
    
    await admin.auth().updateUser(user.uid, { password: newPassword });
    await docRef.update({ used: true });

    return { success: true };
});
