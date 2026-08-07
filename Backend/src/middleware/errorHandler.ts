import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HttpError } from "../utils/HttpError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(404).json({ message: "Recurso não encontrado" });
    return;
  }
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    res.status(409).json({ message: "Registro duplicado" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
}
