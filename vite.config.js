import { defineConfig } from "vite";

// Creating vite config file to bundle frontend tools
export default defineConfig({
    root: "./src/public",
    build: {
        outDir: "../../dist/public", // relative to root
        emptyOutDir: true
    }
});