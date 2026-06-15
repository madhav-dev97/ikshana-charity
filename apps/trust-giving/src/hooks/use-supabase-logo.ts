import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSupabaseLogo() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogo() {
      try {

        const { data: publicData } = supabase.storage
          .from("logos")
          .getPublicUrl("logo.png");

        if (publicData?.publicUrl) {
          const response = await fetch(publicData.publicUrl, { method: "HEAD" });
          if (response.ok) {
            setLogoUrl(publicData.publicUrl);
            setLoading(false);
            return;
          }
        }

        const { data: signedData, error } = await supabase.storage
          .from("logos")
          .createSignedUrl("logo.png", 3600); // 1 hour validity

        if (!error && signedData?.signedUrl) {
          setLogoUrl(signedData.signedUrl);
        } else {
          console.warn("Failed to load logo from Supabase", error);
        }
      } catch (err) {
        console.error("Error loading logo:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogo();
  }, []);

  return { logoUrl, loading };
}
