import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'authoring-kit',
    loadComponent: () =>
      import('./authoring-kit/authoring-kit-page.component').then(
        (module) => module.AuthoringKitPageComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./curriculum/curriculum-page.component').then(
        (module) => module.CurriculumPageComponent,
      ),
  },
  {
    path: 'learning',
    loadComponent: () =>
      import('./learning/learning-home-page.component').then(
        (module) => module.LearningHomePageComponent,
      ),
  },
  {
    path: 'contracts',
    loadComponent: () =>
      import('./contracts/contract-release-page.component').then(
        (module) => module.ContractReleasePageComponent,
      ),
  },
  {
    path: 'learning/versions/:versionId/courses/:courseId',
    loadComponent: () =>
      import('./learning/course-page.component').then((module) => module.CoursePageComponent),
  },
  {
    path: 'learning/versions/:versionId/courses/:courseId/lessons/:lessonId',
    loadComponent: () =>
      import('./learning/lesson-page.component').then((module) => module.LessonPageComponent),
  },
  {
    path: 'systems',
    loadComponent: () =>
      import('./systems/system-map-page.component').then((module) => module.SystemMapPageComponent),
  },
  {
    path: 'quality',
    loadComponent: () =>
      import('./quality/performance-budget-page.component').then(
        (module) => module.PerformanceBudgetPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
