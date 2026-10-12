/** Shared Winston logger with timestamped console and file transports. */
import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const logDirectory = path.resolve(process.cwd(), "logs");
fs.mkdirSync(logDirectory, { recursive: true });

const lineFormat = format.printf(({ timestamp, level, message, ...metadata }) => {
  const context = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
  return `${timestamp} ${level.toUpperCase()}: ${message}${context}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), lineFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDirectory, "test-run.log") })
  ]
});
