export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          message: error.message,
          code: error.code,
          ...(error.details && { details: error.details }),
        },
      },
    };
  }

  // Log unexpected errors but don't expose details to client
  console.error('Unexpected error:', error);
  return {
    status: 500,
    body: {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
  };
}