class ResponseError extends Error {
  public statusCode: number;
  public timestamp: Date;

  constructor(code: number, message: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }

    this.name = 'ResponseError';
    this.statusCode = code;
    this.timestamp = new Date();
  }
}

export default ResponseError;