import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["esnext", "dom", "dom.iterable"],
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@clapp/transporter",
    version,
    description: "IO Stream",
    license: "MIT",
    homepage: "https://github.com/clappcodes/transporter",
    repository: {
      type: "git",
      url: "git+https://github.com/clappcodes/transporter.git",
    },
    bugs: {
      url: "https://github.com/clappcodes/transporter/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
});
