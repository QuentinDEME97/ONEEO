import pino from "pino";

export const logger = pino({
  level: process.env.NUXT_LOG_LEVEL ?? (import.meta.dev ? "debug" : "info"),
  serializers: { err: pino.stdSerializers.err },
  transport: import.meta.dev
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      }
    : undefined,
});
