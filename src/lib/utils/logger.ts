const isProd = process.env.NODE_ENV === "production";

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    if (!isProd) console.info(`[INFO] ${message}`, meta ?? "");
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, meta ?? "");
  },
  error(message: string, meta?: Record<string, unknown>) {
    // Never log raw symptom text — sanitize before passing
    console.error(`[ERROR] ${message}`, meta ?? "");
  },
};
