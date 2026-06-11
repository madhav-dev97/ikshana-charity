// middleware/require-admin.ts

import type { Request, Response, NextFunction } from "express";
import { getSupabaseAdmin } from "../lib/supabase";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const supabase = getSupabaseAdmin();
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        req.user = user; // optional future use

        return next();
    } catch (err) {
        console.error("[auth]", err);

        return res.status(500).json({
            error: "Authentication failed",
        });
    }
}