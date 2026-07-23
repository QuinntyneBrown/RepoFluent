export interface CodeTourStep {
  order: number;
  title: string;
  guidance: string;
  repositoryId: string;
  path: string;
  branch?: string;
  commit?: string;
  language: string;
  startLine: number;
  endLine: number;
  symbol: string;
  excerpt: string;
  contentClassification: string;
  provenance: string;
}
