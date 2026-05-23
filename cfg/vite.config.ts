import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Plugin: rewrite ../src/ui/main.tsx -> absolute /@fs/ path at dev time
function rewriteEntryPlugin(): import('vite').Plugin {
  const absUiPath = path.resolve(__dirname, '../src/ui/main.tsx');
  return {
    name: 'rewrite-entry',
    transformIndexHtml(html) {
      return html.replace(
        '../src/ui/main.tsx',
        `/@fs${absUiPath}`
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [react(), rewriteEntryPlugin()],
  root: __dirname,
  publicDir: path.resolve(__dirname, "../web"),
  build: {
    outDir: path.resolve(__dirname, "../out/web-dist"),
    emptyOutDir: true,
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    fs: {
      allow: [path.resolve(__dirname, "..")]
    },
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: mode === 'demo' ? null : {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**", "**/src/core/target/**"],
    },
  },
}));

