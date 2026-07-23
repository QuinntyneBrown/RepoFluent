export interface SourceCitation {
  sourceId: string;
  document: string;
  locator: string;
  evidenceType: 'direct' | 'synthesis' | 'interpretation';
}
