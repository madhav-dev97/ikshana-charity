import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL;

type Cause = {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  category: string;
  month: number;
  year: number;
};

type MediaItem = {
  id: number;
  mediaType: "photo" | "video";
  filePath: string;
  caption: string | null;
  publicUrl: string;
};

export default function CauseDetail() {
  const { id: causeId } = useParams<{ id: string }>();

  const {
    data: cause,
    isLoading: causeLoading,
    error: causeError,
  } = useQuery<Cause>({
    queryKey: ["cause", causeId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/causes/${causeId}`);

      if (!res.ok) {
        throw new Error("Failed to load cause");
      }

      return res.json();
    },
    enabled: !!causeId,
  });

  const {
    data: media = [],
    isLoading: mediaLoading,
    error: mediaError,
  } = useQuery<MediaItem[]>({
    queryKey: ["cause-media", causeId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/causes/${causeId}/media`);

      if (!res.ok) {
        throw new Error("Failed to load media");
      }

      const items = await res.json();

      return items.map((item: any) => {
        const { data } = supabase.storage
          .from("campaigns")
          .getPublicUrl(item.filePath);

        return {
          ...item,
          publicUrl: data?.publicUrl ?? item.publicUrl ?? "",
        };
      });
    },
    enabled: !!causeId,
  });

  if (causeLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        Loading campaign...
      </div>
    );
  }

  if (causeError || !cause) {
    return (
      <div className="container mx-auto py-10 px-4">
        Campaign not found.
      </div>
    );
  }

  const photos = media.filter((m) => m.mediaType === "photo");
  const videos = media.filter((m) => m.mediaType === "video");

  const progress =
    cause.goalAmount > 0
      ? (cause.raisedAmount / cause.goalAmount) * 100
      : 0;

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">{cause.title}</h1>

        <p className="mt-4 text-gray-600">
          {cause.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Goal Amount</p>
            <p className="text-2xl font-semibold">
              ₹{cause.goalAmount.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Raised</p>
            <p className="text-2xl font-semibold text-green-600">
              ₹{cause.raisedAmount.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-semibold">
              {progress.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-green-600"
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </div>
      </div>

      {mediaLoading ? (
        <p>Loading media...</p>
      ) : (
        <>
          {photos.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-semibold">
                Photo Gallery
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <div key={photo.id}>
                    <img
                      src={photo.publicUrl}
                      alt={photo.caption ?? cause.title}
                      className="h-72 w-full rounded-xl border object-cover"
                      loading="lazy"
                    />

                    {photo.caption && (
                      <p className="mt-2 text-gray-600">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <h2 className="mb-6 text-3xl font-semibold">
                Videos
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {videos.map((video) => (
                  <div key={video.id}>
                    <video
                      controls
                      className="w-full rounded-xl border"
                    >
                      <source
                        src={video.publicUrl}
                      />
                    </video>

                    {video.caption && (
                      <p className="mt-2 text-gray-600">
                        {video.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}