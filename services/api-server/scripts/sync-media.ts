import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { db, campaignMediaTable } from "@workspace/db";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncFolder(causeId: number) {
    for (const mediaType of ["photos", "videos"]) {
        const { data: files, error } = await supabase.storage
            .from("campaigns")
            .list(`${causeId}/${mediaType}`);

        if (error || !files?.length) {
            continue;
        }

        const rows = files
            .filter((file) => !file.name.startsWith("."))
            .map((file, index) => ({
                causeId,
                mediaType: mediaType === "photos" ? "photo" : "video",
                filePath: `${causeId}/${mediaType}/${file.name}`,
                caption: null,
                sortOrder: index + 1,
            }));

        if (rows.length > 0) {
            await db.insert(campaignMediaTable).values(rows);

            console.log(
                `✓ Cause ${causeId}: inserted ${rows.length} ${mediaType}`
            );
        }
    }
}

async function main() {
    for (let causeId = 1; causeId <= 46; causeId++) {
        await syncFolder(causeId);
    }

    console.log("✅ Media sync complete");
}

main().catch(console.error);