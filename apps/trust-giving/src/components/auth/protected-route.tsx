import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const [, navigate] = useLocation();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                navigate("/admin-login");
                return;
            }

            setLoading(false);
        }

        check();
    }, []);

    if (loading) {
        return (
            <div className="p-10">
                Checking session...
            </div>
        );
    }

    return <>{children}</>;
}