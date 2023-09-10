import generated from "../../../worker/lib/generated/client";
import type { AppRouter } from "../../../worker/lib/types";
import { buildClient } from "@beff/client";
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.northwind.d1sql.com/api"
    : "http://127.0.0.1:8787/api";
export const fetchClient = buildClient<AppRouter>({
  generated,
  baseUrl,
});
