export type Persona = 'author' | 'reviewer' | 'administrator' | 'learner';

export type CurriculumStatus =
  'Received' | 'Validating' | 'ValidationFailed' | 'Draft' | 'Approved' | 'Rejected' | 'Published';

export interface ValidationIssue {
  code: string;
  severity: string;
  isBlocking: boolean;
  message: string;
  path: string;
}

export interface ImportReceipt {
  id: string;
  checksum: string;
  status: CurriculumStatus;
  correlationId: string;
  statusUrl: string;
}

export interface ImportStatus {
  id: string;
  title: string;
  checksum: string;
  status: CurriculumStatus;
  issues: ValidationIssue[];
  publishedVersionId: string | null;
  allowedActions: string[];
  correlationId: string;
}

export interface CurriculumPackage {
  contractVersion: string;
  packageId: string;
  version: string;
  title: string;
  description: string;
  owner: string;
  locale: string;
  sourceSnapshot: SourceSnapshot;
  courses: Course[];
}

export interface SourceSnapshot {
  repositories: Repository[];
}

export interface Repository {
  id: string;
  name: string;
  revision: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  objectives: string[];
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: LessonBlock[];
}

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

export interface Preview {
  importId: string;
  isDraft: boolean;
  package: CurriculumPackage;
}

export interface LearningAssignment {
  id: string;
  publishedVersionId: string;
  title: string;
  description: string;
  isRequired: boolean;
  status: string;
  nextAction: string;
  firstCourseId: string;
}

export interface CourseView {
  publishedVersionId: string;
  course: Course;
}

export interface LessonView {
  publishedVersionId: string;
  courseTitle: string;
  lesson: Lesson;
}
