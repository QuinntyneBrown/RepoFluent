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
}
