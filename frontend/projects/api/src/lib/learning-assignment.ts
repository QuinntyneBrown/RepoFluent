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
