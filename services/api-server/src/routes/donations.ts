import { Router } from "express";
import { db, donationsTable, causesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateDonationBody, ListDonorsQueryParams } from "@workspace/api-zod";
import { sendDonationConfirmation } from "../lib/email";
import { sendDonationWhatsApp, sendDonationSMS } from "../lib/whatsapp";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SEVA-${year}${month}-${random}`;
}

router.get("/donors", async (req, res) => {
  try {
    const parsed = ListDonorsQueryParams.safeParse(req.query);
    const { month, year } = parsed.success ? parsed.data : { month: undefined, year: undefined };

    const rows = await db
      .select({
        id: donationsTable.id,
        donorName: donationsTable.donorName,
        amount: donationsTable.amount,
        causeTitle: causesTable.title,
        month: causesTable.month,
        year: causesTable.year,
        isAnonymous: donationsTable.isAnonymous,
        message: donationsTable.message,
        donatedAt: donationsTable.donatedAt,
      })
      .from(donationsTable)
      .leftJoin(causesTable, eq(donationsTable.causeId, causesTable.id))
      .orderBy(desc(donationsTable.donatedAt));

    const filtered = rows.filter((r) => {
      if (month !== undefined && r.month !== month) return false;
      if (year !== undefined && r.year !== year) return false;
      return true;
    });

    const result = filtered.map((r) => ({
      id: r.id,
      name: r.isAnonymous ? "Anonymous" : r.donorName,
      amount: parseFloat(r.amount),
      month: r.month ?? 0,
      year: r.year ?? 0,
      causeTitle: r.causeTitle ?? "",
      isAnonymous: r.isAnonymous,
      message: r.message ?? null,
      donatedAt: r.donatedAt?.toISOString(),
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch donors" });
  }
});

router.post("/donations",   requireAdmin, async (req, res) => {
  try {
    const parsed = CreateDonationBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    }

    const { donorName, email, phone, amount, causeId, message, isAnonymous } = parsed.data;

    const [cause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.id, causeId))
      .limit(1);

    if (!cause) {
      return res.status(404).json({ error: "Cause not found" });
    }

    const receiptNumber = generateReceiptNumber();
    const donatedAt = new Date();

    const [donation] = await db
      .insert(donationsTable)
      .values({
        receiptNumber,
        donorName,
        email,
        phone: phone ?? null,
        amount: String(amount),
        causeId,
        message: message ?? null,
        isAnonymous: isAnonymous ?? false,
        donatedAt,
      })
      .returning();

    await db
      .update(causesTable)
      .set({ raisedAmount: sql`${causesTable.raisedAmount} + ${String(amount)}` })
      .where(eq(causesTable.id, causeId));

    return res.status(201).json({
      receiptId: donation.id,
      receiptNumber,
      donorName,
      email,
      amount,
      causeTitle: cause.title,
      causeDescription: cause.description,
      donatedAt: donatedAt.toISOString(),
      message: message ?? null,
      trustName: "IKSHANA CHARITABLE TRUST",
      taxExemptStatus: "80G application in progress",
    });

    if (email) {
      sendDonationConfirmation({
        donorName,
        email,
        amount,
        causeTitle: cause.title,
        receiptNumber,
        donatedAt: donatedAt.toISOString(),
        message,
      }).catch((err) => console.error("[notifications] email error:", err));
    }

    if (typeof phone === "string") {
      const phoneNumber = phone as string;
      sendDonationWhatsApp({ phone: phoneNumber, donorName, amount, causeTitle: cause.title, receiptNumber })
        .then((sent) => {
          if (!sent) {
            return sendDonationSMS({ phone: phoneNumber, donorName, amount, receiptNumber });
          }
          return undefined;
        })
        .catch((err) => console.error("[notifications] whatsapp/sms error:", err));
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create donation" });
  }
});

export default router;
