/**
 * Tauri API shim — works in a plain web browser without crashing.
 *
 * IMPORTANT: This file must NOT import from @tauri-apps/api/* at all.
 * Those packages call window.__TAURI_INTERNALS__.transformCallback at module
 * load time and crash immediately in a browser. Instead we call the raw Tauri
 * IPC internals directly when available, and return stub values otherwise.
 */

// Detect whether the Tauri IPC bridge is available at runtime
export const IS_TAURI: boolean =
  typeof window !== "undefined" &&
  typeof (window as any).__TAURI_INTERNALS__ !== "undefined";

// --- Types -----------------------------------------------------------------

type InvokeArgs = Record<string, unknown>;
type EventCallback<T> = (event: { payload: T }) => void;
type UnlistenFn = () => void;

// --- invoke ----------------------------------------------------------------

/**
 * Drop-in replacement for @tauri-apps/api/core invoke().
 * Calls the raw Tauri IPC when inside the app, returns stubs in a browser.
 */
export async function invoke<T = void>(
  cmd: string,
  args?: InvokeArgs
): Promise<T> {
  if (IS_TAURI) {
    return (window as any).__TAURI_INTERNALS__.invoke(cmd, args) as Promise<T>;
  }

  console.warn(`[tauri shim] invoke("${cmd}") — not in Tauri, returning stub`);

  // Sensible defaults for every command the app calls at startup
  switch (cmd) {
    case "get_local_profile":           return null as unknown as T;
    case "get_interaction_history":     return [] as unknown as T;
    case "get_peer_profiles":           return [] as unknown as T;
    case "get_chat_history":            return [] as unknown as T;
    case "get_chat_partners":           return [] as unknown as T;
    case "generate_paillier_keypair":   return ["stub_pub", "stub_priv"] as unknown as T;
    case "encrypt_location":            return ["0", "0", "0"] as unknown as T;
    case "compute_homomorphic_distance":return ["0", "1"] as unknown as T;
    case "decrypt_blinded_distance":    return "0" as unknown as T;
    case "generate_range_proof":        return [[], []] as unknown as T;
    case "verify_range_proof":          return false as unknown as T;
    default:                            return undefined as unknown as T;
  }
}

// --- listen ----------------------------------------------------------------

/**
 * Drop-in replacement for @tauri-apps/api/event listen().
 * Returns a no-op unlisten function when not inside Tauri.
 */
export async function listen<T = unknown>(
  event: string,
  handler: EventCallback<T>
): Promise<UnlistenFn> {
  if (IS_TAURI) {
    // Use the raw IPC to register an event listener
    const internals = (window as any).__TAURI_INTERNALS__;
    const id = internals.transformCallback((eventObj: any) =>
      handler(eventObj)
    );
    await internals.invoke("plugin:event|listen", {
      event,
      target: { kind: "Any" },
      handler: id,
    });
    return async () => {
      await internals.invoke("plugin:event|unlisten", { event, eventId: id });
    };
  }

  console.warn(`[tauri shim] listen("${event}") — not in Tauri, no-op`);
  return () => {}; // no-op unlisten
}
