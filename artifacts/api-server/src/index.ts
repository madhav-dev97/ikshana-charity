import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import app from "./app";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envCandidates = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), ".env"),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
if (envPath) {
  dotenv.config({ path: envPath });
}

const rawPort = process.env.PORT ?? "3000";
const preferredPort = Number(rawPort);

if (Number.isNaN(preferredPort) || preferredPort <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const maxRetries = 5;
const tryListen = (portToTry: number) =>
  new Promise<import("node:http").Server>((resolve, reject) => {
    const server = app.listen(portToTry, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
      }
    });
    server.on("error", reject);
  });

(async () => {
  for (let offset = 0; offset < maxRetries; offset += 1) {
    const portToTry = preferredPort + offset;
    try {
      await tryListen(portToTry);
      logger.info({ port: portToTry }, "Server listening");
      return;
    } catch (err: unknown) {
      const typedErr = err as { code?: string };
      if (typedErr.code === "EADDRINUSE") {
        logger.warn(
          { port: portToTry },
          "Port in use, trying next available port",
        );
        continue;
      }
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
  }

  logger.error(
    { startPort: preferredPort, retries: maxRetries },
    "Unable to bind to any available port",
  );
  process.exit(1);
})();
