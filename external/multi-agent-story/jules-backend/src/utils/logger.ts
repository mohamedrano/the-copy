import winston from "winston";

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : "";
    return `${timestamp} [${level}] ${service || ""}: ${message} ${metaStr}`;
  }),
);

const logger = winston.createLogger({
  level: process.env["LOG_LEVEL"] || "info",
  format: logFormat,
  defaultMeta: {
    service: "jules-backend",
  },
  transports: [
    new winston.transports.Console({
      format: process.env["NODE_ENV"] === "production" ? logFormat : consoleFormat,
    }),
  ],
});

// Add file transport in production
if (process.env["NODE_ENV"] === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

export { logger };
