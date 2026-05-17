/**
 * Tauri API shim — safely wraps invoke() and listen() so the app
 * works in a plain web browser (no Tauri runtime) without crashing.
 *
 * When running inside a real Tauri container window.__TAURI__ is
 * present and we delegate to the real @tauri-apps/api functions.
 * When running in a browser we return sensible no-op stubs so the
 * UI still renders and navigation works.
 */

// Detect whether the Tauri IPC bridge is available
export const IS_TAURI =
  typeof window !== "undefined" &&
  // @ts-ignore
  typeof window.__TAURI__ !== "undefined";

// --- invoke ---------------------------------------------------------------

type InvokeArgs = Record<string, unknown>;

/**
 * Drop-in replacement for @tauri-apps/api/core invoke().
 * In a browser it logs a warning and returns a sensible default.
 */
export async function invoke<T = void>(
  cmd: string,
  args?: InvokeArgs
): Promise<T> {
  if (IS_TAURI) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(cmd, args);
  }

  console.warn(`[tauri shim] invoke("${cmd}") called outside Tauri — returning stub`);

  // Return sensible stubs for the commands the app uses on startup
  switch (cmd) {
    case "get_local_profile":
      return null as unknown as T;
    case "get_interaction_history":
      return [] as unknown as T;
    case "get_peer_profiles":
      return [] as unknown as T;
    case "get_chat_history":
      return [] as unknown as T;
    case "generate_paillier_keypair":
      return ["stub_pubkey", "stub_privkey"] as unknown as T;
    case "encrypt_location":
      return ["0", "0", "0"] as unknown as T;
    case "compute_homomorphic_distance":
      return ["0", "1"] as unknown as T;
    case "decrypt_blinded_distance":
      return "0" as unknown as T;
    case "generate_range_proof":
      return [[], []] as unknown as T;
    case "verify_range_proof":
      return false as unknown as T;
    default:
      return undefined as unknown as T;
  }
}

// --- listen ---------------------------------------------------------------

type EventCallback<T> = (event: { payload: T }) => void;
type UnlistenFn = () => void;

/**
 * Drop-in replacement for @tauri-apps/api/event listen().
 * In a browser it returns a no-op unlisten function.
 */
export async function listen<T = unknown>(
  event: string,
  handler: EventCallback<T>
): Promise<UnlistenFn> {
  if (IS_TAURI) {
    const { listen: tauriListen } = await import("@tauri-apps/api/event");
    return tauriListen<T>(event, handler);
  }

  console.warn(`[tauri shim] listen("${event}") called outside Tauri — no-op`);
  return () => {}; // no-op unlisten
}
