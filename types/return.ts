export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    message: string;
    code?: string;
    issues?: Record<string, string[] | undefined>;
  };
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;
