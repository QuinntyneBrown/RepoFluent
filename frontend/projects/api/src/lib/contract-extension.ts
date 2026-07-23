export interface ContractExtension {
  namespace: string;
  version: string;
  critical: boolean;
  data: Record<string, unknown>;
}
