/* ------------------------------------------------------------------
   Salezot — Next.js custom server for Hostinger Node.js hosting
   - Hostinger (Phusion Passenger) injects the PORT env var
   - Keep the app running with `next start` semantics
   - No custom routing here; let Next.js own every request
------------------------------------------------------------------ */

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const { createServer } = require("http");
    createServer((req, res) => handle(req, res)).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Salezot ready on http://${hostname}:${port} (dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
