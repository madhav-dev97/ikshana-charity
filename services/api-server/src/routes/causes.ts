import { Router } from "express";
import { db, causesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/require-admin";

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

router.post("/causes", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      month,
      year,
      goalAmount,
      ngoName,
      imageUrl,
      impact,
      beneficiaries,
      isCurrent,
    } = req.body;

    if (!title || !description || !category || month === undefined || year === undefined || !goalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const m = parseInt(month);
    const y = parseInt(year);
    const goal = parseFloat(goalAmount);

    if (isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }
    if (isNaN(y) || y < 2000) {
      return res.status(400).json({ error: "Invalid year" });
    }
    if (isNaN(goal) || goal <= 0) {
      return res.status(400).json({ error: "Invalid goal amount" });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (isCurrent === true) {
      await db.update(causesTable).set({ isCurrent: false });
    }

    const [inserted] = await db
      .insert(causesTable)
      .values({
        title,
        description,
        category,
        month: m,
        year: y,
        goalAmount: String(goal),
        raisedAmount: "0",
        slug,
        ngoName: ngoName || null,
        imageUrl: imageUrl || null,
        impact: impact || null,
        beneficiaries: beneficiaries ? String(beneficiaries) : null,
        isCurrent: isCurrent === true,
      })
      .returning();

    return res.status(201).json({
      id: inserted.id,
      title: inserted.title,
      description: inserted.description,
      month: inserted.month,
      year: inserted.year,
      goalAmount: parseFloat(inserted.goalAmount),
      raisedAmount: parseFloat(inserted.raisedAmount),
      imageUrl: inserted.imageUrl ?? null,
      category: inserted.category,
      isCurrent: inserted.isCurrent,
      impact: inserted.impact ?? null,
      beneficiaries: inserted.beneficiaries ?? null,
    });
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "A cause with a similar title already exists (duplicate slug)" });
    }
    return res.status(500).json({ error: "Failed to create cause" });
  }
});

router.patch("/causes/:id", requireAdmin, async (req, res) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string" || !/^[0-9]+$/.test(idParam)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const id = Number(idParam);

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
