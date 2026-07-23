import type { RenderableCodeTourStep } from './renderable-code-tour-step';

export interface RenderableBlock {
  type: string;
  text?: string;
  tone?: string;
  title?: string;
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
  steps?: RenderableCodeTourStep[];
}
