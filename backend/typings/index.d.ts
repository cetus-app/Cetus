declare namespace Express {
  export interface Request {
    user?: import("../entities").User;
    verificationService: import("../services").VerificationService;
  }
}
