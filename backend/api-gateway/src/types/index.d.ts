export {};

declare module 'express-session' {
    interface SessionData {
        user: any;
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
