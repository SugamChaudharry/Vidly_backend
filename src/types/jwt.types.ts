import { JwtPayload } from "jsonwebtoken";

export interface AccessTokenType extends JwtPayload {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
}

export interface RefreshTokenType extends JwtPayload {
  _id: string;
}
