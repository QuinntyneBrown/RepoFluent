export interface Repository {
  id: string;
  name: string;
  revision: string | null;
  relativeRoot: string | null;
  branch: string | null;
  commit: string | null;
  documents: string[];
  capturedAt: string | null;
}
