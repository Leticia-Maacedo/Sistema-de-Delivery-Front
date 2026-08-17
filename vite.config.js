import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Bind mount do Docker no Windows não propaga eventos nativos do
      // filesystem (inotify) para dentro do container — sem polling, o
      // Vite serve versões em cache e nunca detecta os arquivos mudando.
      usePolling: true,
      interval: 300,
    },
  },
});
