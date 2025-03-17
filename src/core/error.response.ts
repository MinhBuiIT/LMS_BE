class ErrorResponse extends Error {
  statusCode: number;
  error: any;
  constructor({ message, statusCode, error = null }: { message: string; statusCode: number; error?: any }) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

class BadRequestResponse extends ErrorResponse {
  constructor(message: string, error?: any) {
    super({ message, statusCode: 400, error });
  }
}

class UnauthorizedResponse extends ErrorResponse {
  constructor(message: string, error?: any) {
    super({ message, statusCode: 401, error });
  }
}

class ForbiddenResponse extends ErrorResponse {
  constructor(message: string, error?: any) {
    super({ message, statusCode: 403, error });
  }
}

class NotFoundResponse extends ErrorResponse {
  constructor(message: string, error?: any) {
    super({ message, statusCode: 404, error });
  }
}

export { BadRequestResponse, ErrorResponse, ForbiddenResponse, NotFoundResponse, UnauthorizedResponse };
