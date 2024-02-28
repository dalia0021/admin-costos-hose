import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: "https://hose.luharud.mx",
    resolve: {
        alias: [
          { find: '@src', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
          { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
          { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
          { find: '@composables', replacement: fileURLToPath(new URL('./src/composables', import.meta.url)) },
        ],
      },
});
