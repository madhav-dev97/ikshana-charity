import { db, campaignMediaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.post("/media", requireAdmin, async (req, res) => {
    try {
        const {
            causeId,
            mediaType,
            filePath,
            caption,
            sortOrder,
        } = req.body;

        if (!causeId || !mediaType || !filePath) {
            return res.status(400).json({
                error: "Missing required fields",
            });
        }

        const [media] = await db
            .insert(campaignMediaTable)
            .values({
                causeId,
                mediaType,
                filePath,
                caption: caption ?? null,
                sortOrder: sortOrder ?? 0,
            })
            .returning();

        return res.json(media);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Failed to save media",
        });
    }
});

router.get("/causes/:id/media", async (req, res) => {
    try {
        const causeId = Number(req.params.id);
        const media = await db
            .select()
            .from(campaignMediaTable)
            .where(eq(campaignMediaTable.causeId, causeId));

        if (isNaN(causeId)) {
            return res.status(400).json({
                error: "Invalid cause id",
            });
        }

        return res.json(media);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Failed to fetch media",
        });
    }
});

export default router;