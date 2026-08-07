import path from "path";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { sessionMiddleware } from "./config/session";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import routes from "./routes";

export const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
