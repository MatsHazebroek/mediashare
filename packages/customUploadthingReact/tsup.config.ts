import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  splitting: false,
  sourcemap: true,
  dts: true,
  format: ["esm"],
  entry: ["./index.ts", "./hooks.ts"],
  clean: !opts.watch,
  esbuildOptions: (option) => {
    option.banner = {
      js: `"use client";`,
    };
  },
}));
