type Callback<T = unknown> = () => T;

export class BackoffRetryError extends Error {
  originalError: Error;

  constructor(message?: string, originalError?: unknown) {
    super(message);
    this.name = "BackoffRetryError";
    const fallbackMessage =
      typeof originalError === "string"
        ? originalError
        : "no original error specified";
    this.originalError =
      originalError instanceof Error
        ? originalError
        : new Error(fallbackMessage);
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function backoff<T>(
  fn: Callback<T>,
  max_retries: number,
  retries: number = 0
): Promise<T> {
  try {
    return fn();
  } catch (error) {
    if (retries === max_retries) {
      throw new BackoffRetryError(
        `Exceeded max retries (${max_retries})`,
        error
      );
    }
    await wait(Math.pow(2, retries));
    return backoff<T>(fn, max_retries, retries + 1);
  }
}
