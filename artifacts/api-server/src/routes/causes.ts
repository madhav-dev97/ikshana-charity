import { Router } from "express";
import { db, causesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();

router.get("/causes", async (req, res) => {
  try {
    const causes = await db
      .select()
      .from(causesTable)
      .orderBy(desc(causesTable.year), desc(causesTable.month));

    const result = causes.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      month: c.month,
      year: c.year,
      goalAmount: parseFloat(c.goalAmount),
      raisedAmount: parseFloat(c.raisedAmount),
      imageUrl: c.imageUrl ?? null,
      category: c.category,
      isCurrent: c.isCurrent,
      impact: c.impact ?? null,
      beneficiaries: c.beneficiaries ?? null,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch causes" });
  }
});

router.get("/causes/current", async (req, res) => {
  try {
    const [cause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.isCurrent, true))
      .limit(1);

    if (!cause) {
      return res.status(404).json({ error: "No current cause found" });
    }

    return res.json({
      id: cause.id,
      title: cause.title,
      description: cause.description,
      month: cause.month,
      year: cause.year,
      goalAmount: parseFloat(cause.goalAmount),
      raisedAmount: parseFloat(cause.raisedAmount),
      imageUrl: cause.imageUrl ?? null,
      category: cause.category,
      isCurrent: cause.isCurrent,
      impact: cause.impact ?? null,
      beneficiaries: cause.beneficiaries ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch current cause" });
  }
});

router.patch("/causes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { title, description, goalAmount, isCurrent, impact, beneficiaries } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (goalAmount !== undefined) updateData.goalAmount = String(goalAmount);
    if (impact !== undefined) updateData.impact = impact;
    if (beneficiaries !== undefined) updateData.beneficiaries = beneficiaries;

    if (isCurrent === true) {
      await db.update(causesTable).set({ isCurrent: false });
      updateData.isCurrent = true;
    } else if (isCurrent === false) {
      updateData.isCurrent = false;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [updated] = await db
      .update(causesTable)
      .set(updateData)
      .where(eq(causesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Cause not found" });

    return res.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      month: updated.month,
      year: updated.year,
      goalAmount: parseFloat(updated.goalAmount),
      raisedAmount: parseFloat(updated.raisedAmount),
      imageUrl: updated.imageUrl ?? null,
      category: updated.category,
      isCurrent: updated.isCurrent,
      impact: updated.impact ?? null,
      beneficiaries: updated.beneficiaries ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update cause" });
  }
});

router.get("/causes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [cause] = await db
      .select()
      .from(causesTable)
      .where(eq(causesTable.id, id))
      .limit(1);

    if (!cause) return res.status(404).json({ error: "Cause not found" });

    return res.json({
      id: cause.id,
      title: cause.title,
      description: cause.description,
      month: cause.month,
      year: cause.year,
      goalAmount: parseFloat(cause.goalAmount),
      raisedAmount: parseFloat(cause.raisedAmount),
      imageUrl: cause.imageUrl ?? null,
      category: cause.category,
      isCurrent: cause.isCurrent,
      impact: cause.impact ?? null,
      beneficiaries: cause.beneficiaries ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch cause" });
  }
});

export default router;
