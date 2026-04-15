import "dotenv/config";
import { Worker } from "bullmq";
import { redis } from "./redis.js";
import { sendEmail } from "../email/sendEmail.js";
import { canSendEmail } from "../email/rateLimiter.js";
import { buildDigestEmail } from "../../template/emails/digestNotifications.js";
import { aggregateEvents } from "../email/aggregateEvents.js";

console.log("🚀 Email worker started...");

const MAX_EVENTS = 20;

const baseUrl = process.env.NEXT_PUBLIC_URL || "";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    // DIGEST JOB
    if (job.name === "send-digest") {
      const { userId, email, recipientName } = job.data;

      if (!userId || !email) {
        throw new Error("Invalid job data");
      }

      // Rate limit check (distributed rate limiting)
      if (!(await canSendEmail(userId, "DIGEST"))) {
        console.log("Skipped digest email (rate limited)");
        throw new Error("Rate limited - retry later");
      }

      console.log(`Processing email job: ${email}`);

      const key = `digest:${userId}`;

      const eventsRaw = await redis.lrange(key, 0, -1);

      if (!eventsRaw.length) {
        console.log("No events found for digest");
        return;
      }

      const events = eventsRaw
        .map((e) => {
          try {
            return JSON.parse(e);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (!events.length) {
        console.log("No valid events after parsing");
        return;
      }

      const aggregatedEvents = aggregateEvents(events);

      const hasImportantEvent = aggregatedEvents.some(
        (e) =>
          e.type === "POST_COMMENT" ||
          e.type === "COMMENT_REPLY" ||
          e.type === "USER_FOLLOW",
      );

      if (aggregatedEvents.length < 3 && !hasImportantEvent) {
        console.log("Skipping digest (low signal)");
        return;
      }

      const visibleEvents = aggregatedEvents.slice(0, MAX_EVENTS);
      const remaining = aggregatedEvents.length - MAX_EVENTS;

      const { subject, html } = buildDigestEmail({
        recipientName,
        events: aggregatedEvents,
        visibleEvents,
        remaining,
        baseUrl,
      });

      try {
        await sendEmail({ to: email, subject, html });
        console.log(`Email sent: ${email}`);

        await redis.del(key); // clear after sending
      } catch (err) {
        console.error("Email send error:", err);
        throw err; // let BullMQ retry
      }
    }
  },
  { connection: redis },
);

emailWorker.on("ready", () => {
  console.log("✅ Worker is ready and connected to Redis");
});

emailWorker.on("active", (job) => {
  console.log(`🔥 Processing job: ${job.name} (${job.id})`);
});

emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.name}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.name}`, err);
});

emailWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});
