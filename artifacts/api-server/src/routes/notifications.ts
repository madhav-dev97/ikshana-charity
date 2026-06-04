import { Router } from "express";
import { db, donationsTable, causesTable } from "@workspace/db";
import { eq, desc, isNotNull } from "drizzle-orm";
import { sendMonthlyReminder } from "../lib/email";
import { sendReminderWhatsApp, sendReminderSMS } from "../lib/whatsapp";

const router = Router();

router.post("/admin/send-reminders", async (req, res) => {
  try {
    const [currentCause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.isCurrent, true))
      .limit(1);

    if (!currentCause) {
      return res.status(404).json({ error: "No active cause found" });
    }

    const siteUrl = process.env.SITE_URL || "https://example.com";

    const allDonations = await db
      .select({
        id: donationsTable.id,
        donorName: donationsTable.donorName,
        email: donationsTable.email,
        phone: donationsTable.phone,
        isAnonymous: donationsTable.isAnonymous,
      })
      .from(donationsTable)
      .orderBy(desc(donationsTable.donatedAt));

    const seen = new Set<string>();
    const uniqueDonors = allDonations.filter((d) => {
      const key = d.email ?? d.phone ?? d.donorName;
      if (seen.has(key)) return false;
      seen.add(key);
      return !d.isAnonymous;
    });

    const causeData = {
      causeTitle: currentCause.title,
      causeDescription: currentCause.description,
      goalAmount: parseFloat(currentCause.goalAmount),
      raisedAmount: parseFloat(currentCause.raisedAmount),
      siteUrl,
    };

    let emailSent = 0;
    let whatsappSent = 0;
    let smsSent = 0;
    let skipped = 0;

    for (const donor of uniqueDonors) {
      let notified = false;

      if (donor.email) {
        const ok = await sendMonthlyReminder({
          donorName: donor.donorName,
          email: donor.email,
          ...causeData,
        });
        if (ok) { emailSent++; notified = true; }
      }

      if (donor.phone) {
        const waOk = await sendReminderWhatsApp({
          phone: donor.phone,
          donorName: donor.donorName,
          causeTitle: causeData.causeTitle,
          goalAmount: causeData.goalAmount,
          raisedAmount: causeData.raisedAmount,
          siteUrl,
        });
        if (waOk) { whatsappSent++; notified = true; }
        else {
          const smsOk = await sendReminderSMS({
            phone: donor.phone,
            donorName: donor.donorName,
            causeTitle: causeData.causeTitle,
            siteUrl,
          });
          if (smsOk) { smsSent++; notified = true; }
        }
      }

      if (!notified) skipped++;
    }

    return res.json({
      success: true,
      causeTitle: currentCause.title,
      totalDonors: uniqueDonors.length,
      emailSent,
      whatsappSent,
      smsSent,
      skipped,
    });
  } catch (err) {
    console.error("[reminders]", err);
    return res.status(500).json({ error: "Failed to send reminders" });
  }
});

router.get("/admin/notification-status", async (_req, res) => {
  return res.json({
    email: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    whatsapp: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM),
    sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM),
  });
});

export default router;
