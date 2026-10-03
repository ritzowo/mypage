import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["https://ritzu.dev", "http://localhost:5173"],
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
