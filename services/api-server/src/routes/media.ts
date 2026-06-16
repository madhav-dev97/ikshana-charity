import { db, campaignMediaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { requireAdmin } from "../middlewares/require-admin";
import { getSupabaseAdmin } from "../lib/supabase";

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

router.delete("/media/:id", requireAdmin, async (req, res) => {
    try {
        const mediaId = Number(req.params.id);
        if (isNaN(mediaId) || mediaId <= 0) {
            return res.status(400).json({
                error: "Invalid media id",
            });
        }

        const [media] = await db
            .select()
            .from(campaignMediaTable)
            .where(eq(campaignMediaTable.id, mediaId));

        if (!media) {
            return res.status(404).json({
                error: "Media not found",
            });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { error: storageError } = await supabaseAdmin.storage
            .from("campaigns")
            .remove([media.filePath]);

        if (storageError) {
            console.error("Failed to delete storage object", storageError);
        }

        await db.delete(campaignMediaTable).where(eq(campaignMediaTable.id, mediaId));

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete media" });
    }
});

export default router;