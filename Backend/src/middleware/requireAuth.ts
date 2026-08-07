import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/HttpError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    next(new HttpError(401, "Não autenticado"));
    return;
  }
  next();
}
