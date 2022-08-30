import { getErrorAsString } from "./getErrorAsString";

export interface BetterloxApiErrorOptions {
  error?: unknown;
  statusCode?: number;
}
export class BetterloxApiError extends Error {
  public originalError: Error;
  public statusCode?: number;
  public timestamp: Date;

  constructor(message: string, options: BetterloxApiErrorOptions = {}) {
    const originalMessage = getErrorAsString(options.error);
    super(`${message} *** [original]: ${originalMessage}`);

    this.name = 'BetterloxApiError';
    this.statusCode = options.statusCode;
    this.timestamp = new Date();

    if (options.error instanceof Error) {
      this.originalError = options.error;
    } else {
      this.originalError = new Error(originalMessage);
    }
  }
}