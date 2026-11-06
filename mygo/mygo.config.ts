import { defineConfig } from "mygo-cli";

export default defineConfig({
  name: "mediabunny-poc-mygo",
  identifier: "dev.cs19.mediabunnypoc.mygo",
  version: "0.1.0",
  // The web app is shared with the other frameworks and is built by ../web.
  buildCommand: "cd ../web && pnpm build",
  frontendDist: "../web/dist",
  out: "build",
});
