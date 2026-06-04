import { Router } from "express";
import { db, donationsTable, causesTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (req, res) => {
  try {
    const [totals] = await db
      .select({
        totalDonations: count(donationsTable.id),
        totalRaised: sum(donationsTable.amount),
      })
      .from(donationsTable);

    const donors = await db
      .selectDistinct({ email: donationsTable.email })
      .from(donationsTable);

    const [currentCause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.isCurrent, true))
      .limit(1);

    let currentMonthRaised = 0;
    if (currentCause) {
      const [monthTotals] = await db
        .select({ raised: sum(donationsTable.amount) })
        .from(donationsTable)
        .where(eq(donationsTable.causeId, currentCause.id));
      currentMonthRaised = parseFloat(monthTotals?.raised ?? "0");
    }

    const activeCauses = await db
      .select({ count: count(causesTable.id) })
      .from(causesTable);

    return res.json({
      totalDonations: totals.totalDonations ?? 0,
      totalDonors: donors.length,
      totalRaised: parseFloat(totals.totalRaised ?? "0"),
      currentMonthRaised,
      currentCauseTitle: currentCause?.title ?? "No active cause",
      activeCauses: activeCauses[0]?.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/stats/monthly", async (req, res) => {
  try {
    const causes = await db.select().from(causesTable);

    const result = await Promise.all(
      causes.map(async (cause) => {
        const [stats] = await db
          .select({
            totalRaised: sum(donationsTable.amount),
            donorCount: count(donationsTable.id),
          })
          .from(donationsTable)
          .where(eq(donationsTable.causeId, cause.id));

        return {
          month: cause.month,
          year: cause.year,
          totalRaised: parseFloat(stats?.totalRaised ?? "0"),
          donorCount: stats?.donorCount ?? 0,
          causeTitle: cause.title,
        };
      })
    );

    result.sort((a, b) => b.year - a.year || b.month - a.month);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
});

export default router;
