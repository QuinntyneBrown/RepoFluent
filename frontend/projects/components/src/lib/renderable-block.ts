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
}
