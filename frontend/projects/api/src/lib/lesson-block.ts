import type { CodeTourStep } from './code-tour-step';

export interface LessonBlock {
  type: string;
  text?: string;
  tone?: string;
  title?: string;
  repositoryId?: string;
  path?: string;
  language?: string;
  startLine?: number;
  endLine?: number;
  symbol?: string;
  explanation?: string;
  description?: string;
  alternativeText?: string;
  labels?: string[];
  branch?: string;
  commit?: string;
  excerpt?: string;
  contentClassification?: string;
  provenance?: string;
  term?: string;
  definition?: string;
  prompt?: string;
  assessmentId?: string;
  resourceUrl?: string;
  steps?: CodeTourStep[];
}
