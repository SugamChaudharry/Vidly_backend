import path from "path";
import { environment, logDirectory } from "../config";
import fs from "fs";
import winston, { createLogger, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

let dir = logDirectory ?? "log";

if (!dir) {
  dir = path.resolve("log");
}

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
const LogLevel = environment === "development" ? "debug" : "warn";

const dailyRotateFile = new DailyRotateFile({
  level: LogLevel,
  filename: `${dir}/%DATE%-results.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  handleExceptions: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
});

export default createLogger({
  transports: [
    new winston.transports.Console({
      level: LogLevel,
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.prettyPrint()
      ),
    }),
    dailyRotateFile,
  ],
  exceptionHandlers: [dailyRotateFile],
  exitOnError: false,
});
