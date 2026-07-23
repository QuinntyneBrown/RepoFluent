import type { SourceCitation } from './source-citation';

export interface EvidenceMetadata {
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  citations: SourceCitation[];
  assumptions: string[];
  omissions: string[];
  conflictingSources: string[];
  unresolvedQuestions: string[];
}
