export {};

declare module 'express-session' {
    interface SessionData {
        userId: number;
        isAdmin: boolean;
    }
}

declare global {
    namespace Express {
      export interface Request {
        currentUser?: User;
      }
    }
}
