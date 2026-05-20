/**
 * Aura Configuration
 * Flags are controlled via Vite environment files — do NOT edit manually.
 *
 * Production (default):  npm run dev           → cfg/.env
 * Demo / screenshots:    npm run dev:demo       → cfg/.env.demo
 * Build (production):    make build             → cfg/.env
 * Build (demo):          make build -- --mode demo → cfg/.env.demo
 *
 * To run the dev server in demo mode:
 *   npm run dev:demo   (from cfg/)
 */

const bool = (val: string | undefined) => val === "true";

export const DEMO_CONFIG = {
  IS_DEMO_MODE:          bool(import.meta.env.VITE_DEMO_MODE),
  FORCE_RESET_ON_LAUNCH: bool(import.meta.env.VITE_FORCE_RESET),
  INSTANT_MATCH_ON_LIKE: false,
  MUTUAL_MATCH_DEMO:     true,
  BYPASS_DB_PERSISTENCE: bool(import.meta.env.VITE_BYPASS_DB),
  USE_SEED_PROFILES:     bool(import.meta.env.VITE_USE_SEED_PROFILES),
};
