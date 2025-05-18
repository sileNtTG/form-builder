import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath, URL } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:color";
          @use "@/assets/scss/abstracts/variables" as *;
          @use "@/assets/scss/abstracts/fonts" as *;
          @use "@/assets/scss/abstracts/mixins" as *;
          @use "@/assets/scss/abstracts/functions" as *;
        `,
      },
    },
  },
});
