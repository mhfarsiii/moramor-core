export interface JwtPayload {
  sub: string; // user id
  phoneNumber: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}
