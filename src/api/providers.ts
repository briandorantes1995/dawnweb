// src/api/providers.ts
import { useApi } from "../hooks/useApi";

export type Provider = {
  id: string;
  name: string;
  legal_name?: string | null;
  agreement_id?: string;
  agreement_status?: "pending" | "active";
};

export type ProvidersResponse = {
  total: number;
  pending: any[];
  active: any[];
};

export function useProvidersService() {
  const { get, post } = useApi();

  const fetchProviders = async (): Promise<ProvidersResponse> => {
    return await get<ProvidersResponse>("/providers/agreements");
  };

  const acceptAgreement = async (agreementId: string): Promise<any> => {
    return await post<any>(`/providers/agreements/${agreementId}/accept`, {});
  };

  return {
    fetchProviders,
    acceptAgreement,
  };
}

