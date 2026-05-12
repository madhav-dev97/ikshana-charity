import { Router } from "express";
import { db, donationsTable, causesTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { CreateDonationBody } from "@workspace/api-zod";

const router = Router();

function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `SEVA-${year}${month}-${rand}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

router.get("/donors", async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    let query = db
      .select({
        id: donationsTable.id,
        donorName: donationsTable.donorName,
        amount: donationsTable.amount,
        causeId: donationsTable.causeId,
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

    const donations = await query;

    const filtered = donations.filter((d) => {
      if (month !== undefined && d.month !== month) return false;
      if (year !== undefined && d.year !== year) return false;
      return true;
    });

    const result = filtered.map((d) => ({
      id: d.id,
      name: d.isAnonymous ? "Anonymous" : d.donorName,
      amount: parseFloat(d.amount),
      month: d.month ?? 0,
      year: d.year ?? 0,
      causeTitle: d.causeTitle ?? "Unknown Cause",
      isAnonymous: d.isAnonymous,
      message: d.message ?? null,
      donatedAt: d.donatedAt?.toISOString() ?? new Date().toISOString(),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch donors" });
  }
});

router.post("/donations", async (req, res) => {
  try {
    const parsed = CreateDonationBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    }

    const { donorName, email, amount, causeId, message, isAnonymous, phone } = parsed.data;

    const [cause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.id, causeId))
      .limit(1);

    if (!cause) {
      return res.status(400).json({ error: "Cause not found" });
    }

    const receiptNumber = generateReceiptNumber();

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
      })
      .returning();

    await db
      .update(causesTable)
      .set({ raisedAmount: sql`${causesTable.raisedAmount} + ${amount}` })
      .where(eq(causesTable.id, causeId));

    const monthName = MONTH_NAMES[(cause.month ?? 1) - 1];

    res.status(201).json({
      receiptId: donation.id,
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      email: donation.email,
      amount: parseFloat(donation.amount),
      causeTitle: cause.title,
      causeDescription: cause.description,
      donatedAt: donation.donatedAt.toISOString(),
      message: donation.message ?? null,
      trustName: "IKSHANA CHARITABLE TRUST",
      taxExemptStatus: "This trust is registered under the Indian Trusts Act (Trust Reg. No. 242/2023, Telangana). An application for 80G tax exemption is currently in progress with the Income Tax Department. An updated receipt will be issued once approved.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process donation" });
  }
});

export default router;
