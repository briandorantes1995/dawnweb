// src/api/providers.ts
import { useApi } from "../hooks/useApi";

export type Provider = {
  id: string;
  name: string;
  legal_name?: string | null;
};

export type ProvidersResponse = {
  total: number;
  pending: any[];
  active: any[];
};

export function useProvidersService() {
  const { get } = useApi();

  const fetchProviders = async (): Promise<ProvidersResponse> => {
    return await get<ProvidersResponse>("/providers/agreements");
  };

  return {
    fetchProviders,
  };
}

