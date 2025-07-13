class ApiError extends Error {
  public statusCode: number;
  public errors: unknown[];
  public success: boolean;
  public data: null;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.data = null;

    // Restore prototype chain (important for extending Error in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
