import { Request, Response } from "express";
import { Action as DefaultAction } from "routing-controllers";

// Extend in case more properties are added at some point
// `context` is Koa only
export interface Action extends Omit<DefaultAction, "context"> {
  request: Request;
  response: Response;
}
