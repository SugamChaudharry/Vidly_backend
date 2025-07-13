class ApiResponse<T> {
  public statusCode: number;
  public data: T;
  message: string = "Success";
  success: boolean;

  constructor(
    statusCode: number,
    data: T,
    message: string = "Success"
  ) {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}

export { ApiResponse }
