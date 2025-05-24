import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/test-files/user/*.json",
          dest: "test-files/user",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      "@/components": path.resolve("./src/components"),
      "@/assets": path.resolve("./src/assets"),
      "@/icons": path.resolve("./src/assets/icons"),
      "@/images": path.resolve("./src/assets/images"),
      "@/stores": path.resolve("./src/stores"),
      "@/models": path.resolve("./src/models"),
      "@/views": path.resolve("./src/views"),
      "@/common": path.resolve("./src/components/common"),
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
