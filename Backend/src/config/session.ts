import session from "express-session";
import MongoStore from "connect-mongo";
import { env } from "./env";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const sessionMiddleware = session({
  name: "grz.sid",
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    collectionName: "sessions",
    ttl: FOURTEEN_DAYS_MS / 1000,
  }),
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: FOURTEEN_DAYS_MS,
  },
});
