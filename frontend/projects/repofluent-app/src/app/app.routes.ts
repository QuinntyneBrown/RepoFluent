import { Routes } from '@angular/router';
import { CoursePageComponent } from './learning/course-page.component';
import { CurriculumPageComponent } from './curriculum/curriculum-page.component';
import { LearningHomePageComponent } from './learning/learning-home-page.component';
import { LessonPageComponent } from './learning/lesson-page.component';
import { SystemMapPageComponent } from './systems/system-map-page.component';

export const routes: Routes = [
  { path: '', component: CurriculumPageComponent },
  { path: 'learning', component: LearningHomePageComponent },
  {
    path: 'learning/versions/:versionId/courses/:courseId',
    component: CoursePageComponent,
  },
  {
    path: 'learning/versions/:versionId/courses/:courseId/lessons/:lessonId',
    component: LessonPageComponent,
  },
  { path: 'systems', component: SystemMapPageComponent },
  { path: '**', redirectTo: '' },
];
