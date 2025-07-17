import { UserDoc } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user: UserDoc;
    }
  }
}

export { }; // <-- Required to make this a module and avoid TS errors
