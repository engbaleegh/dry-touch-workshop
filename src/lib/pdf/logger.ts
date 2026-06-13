const PREFIX = "[pdf-export]";

export function logPdfInfo(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.info(PREFIX, message, meta);
  } else {
    console.info(PREFIX, message);
  }
}

export function logPdfError(
  message: string,
  error: unknown,
  meta?: Record<string, unknown>
) {
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) };

  console.error(PREFIX, message, { ...meta, error: err });
}
