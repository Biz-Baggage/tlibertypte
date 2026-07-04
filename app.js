// cPanel / Passenger entry point.
// Passenger requires a single startup file at the app root. Passenger sets
// process.env.PORT and expects the app to listen on it. Nitro's node-server
// preset already reads PORT and HOST from the environment, so we just import
// the built server bundle produced by `bun run build:node`.
//
// Prereqs on the server:
//   1. `bun install` (or `npm install`)
//   2. `bun run build:node`   ← MUST be the node-server build, not the default
//   3. Restart the Node.js app in cPanel
//
// If Passenger reports "Cannot find module '.output/server/index.mjs'",
// the build step was skipped or used the wrong preset.

import("./.output/server/index.mjs").catch((err) => {
  console.error("[cpanel] Failed to start server bundle:", err);
  process.exit(1);
});