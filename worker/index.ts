import { buildHonoApp } from "@beff/hono";
import router from "./lib/router";
import generated from "./lib/generated/router";
import { Hono } from "hono";

const api = buildHonoApp({
  router,
  generated,
});
const app = new Hono({ strict: false });
app.route("/api", api);
export default app;
