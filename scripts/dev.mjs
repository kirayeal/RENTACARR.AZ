import { createServer } from "node:http";
import { createServer as createVite, loadEnv } from "vite";
import auth from "../api/auth.js";
import listings from "../api/listings.js";
import workspace from "../api/workspace.js";
import owners from "../api/owners.js";
Object.assign(process.env, loadEnv("development", process.cwd(), ""));
const handlers = {
  "/api/auth": auth,
  "/api/listings": listings,
  "/api/workspace": workspace,
  "/api/owners": owners,
};
let vite;
const server = createServer((req, res) => {
  const path = new URL(req.url, "http://local").pathname;
  const handler = handlers[path];
  if (handler) return handler(req, res);
  if (path.startsWith("/api/")) {
    res.statusCode = 404;
    return res.end("Not found");
  }
  vite.middlewares(req, res);
});
vite = await createVite({
  server: { middlewareMode: true, hmr: { server } },
  appType: "spa",
});
const portIndex = process.argv.indexOf("--port");
const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 3000;
server.listen(port, "0.0.0.0", () =>
  console.log(`RENTACARR: http://localhost:${port}`),
);
