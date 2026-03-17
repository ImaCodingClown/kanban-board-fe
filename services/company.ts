import { api, apiPath } from "./api";
import {
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CompanyResponse,
  CompaniesResponse,
  CompanyWithUsernamesResponse,
} from "@/models/company";

export const companyService = {
  async getUserCompanies(): Promise<CompaniesResponse> {
    // For now, we'll use the user's group field as companies
    // This can be replaced with actual API call when backend is ready
    const response = await api.get<CompaniesResponse>(apiPath("/companies"));
    return response.data;
  },

  async getCompany(companyId: string): Promise<CompanyResponse> {
    const response = await api.get<CompanyResponse>(
      apiPath(`/companies/${companyId}`),
    );
    return response.data;
  },

  async getCompanyWithUsernames(
    companyId: string,
  ): Promise<CompanyWithUsernamesResponse> {
    const response = await api.get<CompanyWithUsernamesResponse>(
      apiPath(`/companies/${companyId}/with-usernames`),
    );
    return response.data;
  },

  async createCompany(payload: CreateCompanyPayload): Promise<CompanyResponse> {
    const response = await api.post<CompanyResponse>(
      apiPath("/companies"),
      payload,
    );
    return response.data;
  },

  async updateCompany(
    companyId: string,
    payload: UpdateCompanyPayload,
  ): Promise<CompanyResponse> {
    const response = await api.put<CompanyResponse>(
      apiPath(`/companies/${companyId}`),
      payload,
    );
    return response.data;
  },

  async deleteCompany(companyId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(
      apiPath(`/companies/${companyId}`),
    );
    return response.data;
  },

  async addMember(companyId: string, userId: string): Promise<CompanyResponse> {
    const response = await api.post<CompanyResponse>(
      apiPath(`/companies/${companyId}/members`),
      { user_id: userId },
    );
    return response.data;
  },

  async removeMember(
    companyId: string,
    userId: string,
  ): Promise<CompanyResponse> {
    const response = await api.delete<CompanyResponse>(
      apiPath(`/companies/${companyId}/members`),
      { data: { user_id: userId } },
    );
    return response.data;
  },
};
