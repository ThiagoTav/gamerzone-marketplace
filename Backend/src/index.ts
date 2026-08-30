import fs from "fs";
import path from "path";
import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function main() {
  fs.mkdirSync(path.join(__dirname, "../uploads/products"), { recursive: true });
  fs.mkdirSync(path.join(__dirname, "../uploads/avatars"), { recursive: true });
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
