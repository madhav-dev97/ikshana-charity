import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/healthz", requireAdmin, (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  return res.json(data);
});

export default router;
