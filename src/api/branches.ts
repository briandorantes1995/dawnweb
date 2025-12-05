// src/api/branches.ts
import { useApi } from "../hooks/useApi";

export type Branch = {
  id: string;
  name: string;
  address?: string | null;
};

export type BranchesResponse = {
  activeBranches: Branch[];
  inactiveBranches: Branch[];
};

export function useBranchesService() {
  const { get } = useApi();

  const fetchBranches = async (): Promise<BranchesResponse> => {
    return await get<BranchesResponse>("/branch/");
  };

  return {
    fetchBranches,
  };
}

