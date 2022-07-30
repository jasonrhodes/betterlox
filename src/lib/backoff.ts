import axios from "axios";

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
  messageOnFail: string = 'Backoff failed',
  retries: number = 0
): Promise<T | null> {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("Axios 404 error in backoff, exiting early");
      return null;
    }

    if (retries === max_retries) {
      throw new BackoffRetryError(
        `${messageOnFail}: Exceeded max retries (${max_retries})`,
        error
      );
    }

    await wait(Math.pow(2, retries));
    const result = await backoff<T>(fn, max_retries, messageOnFail, retries + 1);
    return result;
  }
}
