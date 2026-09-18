import { defineConfig } from 'vite';
export default defineConfig({
  // Three ships browser-ready ESM; avoiding prebundling also supports restricted Windows workspaces.
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: '0.0.0.0', port: 5186, strictPort: true },
  build: { chunkSizeWarningLimit: 520, rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
});
