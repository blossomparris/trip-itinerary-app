const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const db = admin.firestore();
const APP_URL = "https://eurosummer2026.expo.app";

async function getEnabledTokens() {
  const snapshot = await db
    .collection("tripmuse-push-tokens")
    .where("enabled", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      token: doc.data().token,
    }))
    .filter((item) => !!item.token);
}

function chunkArray(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function sendPushToAll({ title, body, data = {} }) {
  const tokenRecords = await getEnabledTokens();

  if (tokenRecords.length === 0) {
    logger.info("No push tokens registered yet.");
    return;
  }

  const chunks = chunkArray(tokenRecords, 500);

  for (const chunk of chunks) {
    const tokens = chunk.map((item) => item.token);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        url: APP_URL,
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, String(value ?? "")])
        ),
      },
      webpush: {
        fcmOptions: {
          link: APP_URL,
        },
        notification: {
          icon: "/icon.png",
          badge: "/icon.png",
        },
      },
    });

    if (response.failureCount > 0) {
      const deletes = [];

      response.responses.forEach((sendResponse, index) => {
        if (!sendResponse.success) {
          const code = sendResponse.error?.code || "";

          logger.warn("Push send failed", {
            code,
            message: sendResponse.error?.message,
          });

          if (
            code.includes("registration-token-not-registered") ||
            code.includes("invalid-registration-token")
          ) {
            deletes.push(
              db.collection("tripmuse-push-tokens").doc(chunk[index].id).delete()
            );
          }
        }
      });

      await Promise.all(deletes);
    }
  }
}

exports.sendAnnouncementPush = onDocumentCreated(
  "tripmuse-announcements/{announcementId}",
  async (event) => {
    const announcement = event.data?.data();

    if (!announcement) return;

    const title = announcement.title || "Trip Update";
    const body = announcement.body || "New announcement in EuroSummer2026.";

    await sendPushToAll({
      title: `EuroSummer2026: ${title}`,
      body,
      data: {
        type: "announcement",
        announcementId: event.params.announcementId,
      },
    });
  }
);

exports.sendEventReminderPushes = onSchedule("every 60 minutes", async () => {
  const now = Date.now();
  const next25Hours = now + 25 * 60 * 60 * 1000;
  const next3Hours = now + 3 * 60 * 60 * 1000;

  const snapshot = await db.collection("tripmuse-event-reminders").get();

  for (const doc of snapshot.docs) {
    const reminder = doc.data();
    const eventAtMillis = Number(reminder.eventAtMillis || 0);

    if (!eventAtMillis || eventAtMillis < now) continue;

    if (!reminder.reminder24Sent && eventAtMillis <= next25Hours) {
      await sendPushToAll({
        title: "Event Tomorrow ✨",
        body: `${reminder.title || "Trip event"} is coming up ${reminder.dateLabel || ""} ${
          reminder.time || ""
        }${reminder.location ? ` at ${reminder.location}` : ""}`.trim(),
        data: {
          type: "event-reminder-24h",
          eventId: reminder.eventId || doc.id,
        },
      });

      await doc.ref.set(
        {
          reminder24Sent: true,
          reminder24SentAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (!reminder.reminder2Sent && eventAtMillis <= next3Hours) {
      await sendPushToAll({
        title: "Event Coming Up Soon ⏰",
        body: `${reminder.title || "Trip event"} starts ${
          reminder.time || "soon"
        }${reminder.location ? ` at ${reminder.location}` : ""}.`,
        data: {
          type: "event-reminder-2h",
          eventId: reminder.eventId || doc.id,
        },
      });

      await doc.ref.set(
        {
          reminder2Sent: true,
          reminder2SentAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
});
