
type Role=
  "ADMIN" |
  "SALES_EXUCUTIVE_MEMBER"|
  "SALES_EXUCUTIVE_TL"|
  "SALES_EXUCUTIVE_MANAGER"|
  "OPERATION"


export interface AuthenticatedUserPayload {
  id: string;
  username: string;
  role: Role;
}