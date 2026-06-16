import * as React from "react";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL;

type MediaUploadProps = {
    onChange: (files: FileList | null) => void;
    onUploadComplete?: () => void;
    className?: string;
    causeId?: string | number;
};

export function MediaUpload({ onChange, onUploadComplete, className, causeId }: MediaUploadProps) {
    const [fileNames, setFileNames] = React.useState<string[]>([]);

    const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setFileNames(files.map((file) => file.name));
        onChange(event.target.files);

        if (!causeId || files.length === 0) return;

        const {
            data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;
        if (!token) return;

        const mediaEndpoint = API_BASE ? `${API_BASE}/api/media` : "/api/media";

        for (const file of files) {
            const isVideo = file.type.startsWith("video");
            const folder = isVideo ? "videos" : "photos";
            const extension = file.name.split(".").pop() ?? "";
            const fileName = `${folder.slice(0, -1)}-${Date.now()}.${extension}`;
            const path = `${causeId}/${folder}/${fileName}`;

            const { error } = await supabase.storage
                .from("campaigns")
                .upload(path, file, {
                    upsert: false,
                });

            if (error) continue;

            await fetch(mediaEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    causeId,
                    mediaType: isVideo ? "video" : "photo",
                    filePath: path,
                    sortOrder: 0,
                }),
            });
        }

        if (typeof onUploadComplete === "function") {
            onUploadComplete();
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <label htmlFor="media-upload" className="text-sm font-medium">
                Upload photos or videos
            </label>
            <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFiles}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {fileNames.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    Selected files: {fileNames.join(", ")}
                </div>
            )}
        </div>
    );
}
