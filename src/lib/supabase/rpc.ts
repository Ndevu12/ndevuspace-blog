// Shared helpers for parsing Supabase RPC responses. RPCs in this project
// return a jsonb envelope (an object), so services repeatedly need to assert
// "this is an object" before reading fields. Centralise that here.

export type RpcObject = Record<string, unknown>;

/**
 * Assert that an RPC response is a non-null object and narrow it to
 * {@link RpcObject}. Throws with `message` otherwise.
 */
export function assertRpcObject(
  data: unknown,
  message = "Invalid RPC response."
): RpcObject {
  if (!data || typeof data !== "object") {
    throw new Error(message);
  }
  return data as RpcObject;
}
