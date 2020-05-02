declare namespace Express {
  export interface Request {
    user?: import("../entities").User;
  }
}
