// User.ts
import { Role } from "./ProjectRole";
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  role: Role | null;
  isAdmin: boolean;
  createdAt: string;
}