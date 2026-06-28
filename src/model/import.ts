export const ImportJobStatus = {
  Queued: "queued",
  Processing: "processing",
  Succeeded: "succeeded",
  Failed: "failed",
} as const;

export type ImportJobStatus = (typeof ImportJobStatus)[keyof typeof ImportJobStatus];

export const ImportJobChunkStatus = {
  Queued: "queued",
  Processing: "processing",
  Succeeded: "succeeded",
  Failed: "failed",
} as const;

export type ImportJobChunkStatus = (typeof ImportJobChunkStatus)[keyof typeof ImportJobChunkStatus];
