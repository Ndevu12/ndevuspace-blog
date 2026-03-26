export type Result<T, E> = SuccessResult<T> | ErrorResult<E>;

export type SuccessResult<T> = {
  ok: true;
  data: T;
};

export type ErrorResult<E> = {
  ok: false;
  error: E;
};

/**
 * Builds a typed success result payload.
 */
export function ok<T>(data: T): SuccessResult<T> {
  return { ok: true, data };
}

/**
 * Builds a typed error result payload.
 */
export function err<E>(error: E): ErrorResult<E> {
  return { ok: false, error };
}
