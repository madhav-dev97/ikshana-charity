import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
// Configure CORS explicitly so production deployments can control allowed origins.
// Use ALLOWED_ORIGINS env var (comma-separated) or default to allow all origins.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : undefined;

app.use(
  cors({
    origin: allowedOrigins ?? true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Ensure CORS headers are present even when an error occurs so the browser
// doesn't block the response before the client can see the error details.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!res.headersSent) {
      const originHeader = req.headers.origin as string | undefined;
      const originToSet = Array.isArray(allowedOrigins)
        ? originHeader && allowedOrigins.includes(originHeader)
          ? originHeader
          : allowedOrigins[0]
        : '*';
      res.setHeader('Access-Control-Allow-Origin', originToSet as string);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  } catch (e) {
    // ignore header-setting errors
  }
  next(err);
});

export default app;
