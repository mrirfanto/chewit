/**
 * Custom error types for better error handling
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Get user-friendly error message based on error code
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23505':
        return 'This deck already exists.';
      case '23503':
        return 'Connection issue. Please check your internet connection.';
      case 'PGRST116':
        return 'Deck not found. It may have been deleted.';
      default:
        return error.message || 'Database operation failed.';
    }
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    if (error.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (error.statusCode === 500) {
      return 'Server error. Please try again later.';
    }
    return 'Network error. Please check your connection.';
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Get user action suggestion based on error
 */
export function getErrorAction(error: Error): string | null {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23505':
        return 'Try refreshing the page.';
      case '23503':
        return 'Check your internet connection and try again.';
      case 'PGRST116':
        return 'The deck may have been deleted. Try refreshing.';
      default:
        return 'Try again or contact support if the problem persists.';
    }
  }

  if (error instanceof ValidationError) {
    return 'Please check your input and try again.';
  }

  if (error instanceof NetworkError) {
    return 'Check your internet connection and try again.';
  }

  return null;
}
