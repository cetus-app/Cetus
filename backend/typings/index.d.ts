declare namespace Express {
  export interface Request {
    user?: import("../entities").User;
    verificationService: import("../services").VerificationService;
    userService: import("../services").UserService;
    groupService: import("../services").GroupService;
  }
}

// See: https://docs.sentry.io/platforms/node/typescript/
declare namespace NodeJS {
    interface Global {
      sentryRoot: string;
    }
  }
