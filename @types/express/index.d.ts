import { User } from "../../src/entities";

declare global {
  namespace Express {
    interface Request {
      currentUser: User;
    }
  }
}
