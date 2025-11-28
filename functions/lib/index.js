"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithCode = exports.verifyPasswordResetCode = exports.requestPasswordResetCode = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
const params_1 = require("firebase-functions/params");
admin.initializeApp();
const db = admin.firestore();
// Resend config
const resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
// Spør passord reset kode
exports.requestPasswordResetCode = (0, https_1.onCall)({ region: "europe-west1", secrets: [resendApiKey], enforceAppCheck: false }, async (request) => {
    const resend = new resend_1.Resend(resendApiKey.value());
    // Request data  
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
    console.log(">>> VERSJON RESEND-FIX: STARTER NÅ <<<");
    if (!rawEmail) {
        throw new https_1.HttpsError("invalid-argument", "Mangler e-postadresse.");
    }
    let user;
    try {
        user = await admin.auth().getUserByEmail(rawEmail);
    }
    catch (error) {
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
        if (error)
            console.error("Resend error:", error);
        else
            console.log("Resend success:", emailData);
    }
    catch (err) {
        console.error("Resend exception:", err);
    }
    return { ok: true };
});
// kode verifisering
exports.verifyPasswordResetCode = (0, https_1.onCall)({ region: "europe-west1", enforceAppCheck: false }, async (request) => {
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
    const code = (data.code || "").toString().trim();
    if (!rawEmail || !code) {
        throw new https_1.HttpsError("invalid-argument", "Mangler e-post eller kode.");
    }
    const user = await admin.auth().getUserByEmail(rawEmail);
    const docRef = db.collection("password_reset_codes").doc(user.uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        throw new https_1.HttpsError("not-found", "Ingen kode funnet.");
    }
    const dataDb = docSnap.data();
    if (!dataDb || dataDb.code !== code) {
        await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        throw new https_1.HttpsError("invalid-argument", "Feil kode.");
    }
    if (dataDb.used) {
        throw new https_1.HttpsError("failed-precondition", "Koden er allerede brukt.");
    }
    if (dataDb.expiresAt.toDate().getTime() < Date.now()) {
        throw new https_1.HttpsError("deadline-exceeded", "Koden har utløpt.");
    }
    return { ok: true };
});
// reset passord kode
exports.resetPasswordWithCode = (0, https_1.onCall)({ region: "europe-west1", enforceAppCheck: false }, async (request) => {
    const data = request.data;
    const rawEmail = (data.email || "").toString().trim().toLowerCase();
    const code = (data.code || "").toString().trim();
    const newPassword = (data.newPassword || "");
    if (!rawEmail || !code || !newPassword) {
        throw new https_1.HttpsError("invalid-argument", "Mangler info.");
    }
    const user = await admin.auth().getUserByEmail(rawEmail);
    const docRef = db.collection("password_reset_codes").doc(user.uid);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    await docRef.update({ used: true });
    return { success: true };
});
//# sourceMappingURL=index.js.map