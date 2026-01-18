export interface CompanyMember {
  user_id: string;
  username: string;
  email: string;
  role: CompanyRole;
  joined_at: string;
}

export enum CompanyRole {
  Owner = "Owner",
  Member = "Member",
}

export interface Company {
  _id?: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_username: string;
  members: CompanyMember[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateCompanyPayload {
  name: string;
  description?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  description?: string;
}

export interface CompanyResponse {
  success: boolean;
  company?: Company;
  message?: string;
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
  message?: string;
}
