import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      pages: "/src/pages",
      components: "/src/components",
      styles: "/src/styles",
      utils: "/src/utils",
      icons: "/src/icons",
      types: "/src/types",
      constants: "/src/constants",
      services: "/src/services",
      hooks: "/src/hooks",
    },
  },

  server: {
    host: true,
  },
});
