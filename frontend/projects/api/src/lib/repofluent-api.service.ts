import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { AuthoringKitRelease } from './authoring-kit-release';
import type { ContractRelease } from './contract-release';
import type { CourseView } from './course-view';
import type { ImportReceipt } from './import-receipt';
import type { ImportStatus } from './import-status';
import type { LearningAssignment } from './learning-assignment';
import type { LessonView } from './lesson-view';
import type { Preview } from './preview';

@Injectable({ providedIn: 'root' })
export class RepoFluentApiService {
  private readonly http = inject(HttpClient);

  getContractRelease(version = '0.1.0'): Observable<ContractRelease> {
    return this.http.get<ContractRelease>(`/api/contracts/curriculum/releases/${version}`);
  }

  getAuthoringKitRelease(version = '0.1.0'): Observable<AuthoringKitRelease> {
    return this.http.get<AuthoringKitRelease>(`/api/authoring-kits/releases/${version}`);
  }

  upload(file: File): Observable<ImportReceipt> {
    const body = new FormData();
    body.append('package', file, file.name);
    return this.http.post<ImportReceipt>('/api/curriculum-imports', body);
  }

  getImport(id: string): Observable<ImportStatus> {
    return this.http.get<ImportStatus>(`/api/curriculum-imports/${id}`);
  }

  getPreview(id: string): Observable<Preview> {
    return this.http.get<Preview>(`/api/curriculum-drafts/${id}/preview`);
  }

  approve(id: string, checksum: string): Observable<ImportStatus> {
    return this.http.post<ImportStatus>(`/api/curriculum-drafts/${id}/review-decisions`, {
      decision: 'approved',
      checksum,
    });
  }

  acknowledgeWarnings(
    id: string,
    packageChecksum: string,
    issueChecksum: string,
  ): Observable<ImportStatus> {
    return this.http.post<ImportStatus>(`/api/curriculum-drafts/${id}/warning-acknowledgements`, {
      packageChecksum,
      issueChecksum,
      rationale: 'Reviewed against the exact local validation report.',
    });
  }

  publish(id: string): Observable<ImportStatus> {
    return this.http.post<ImportStatus>(`/api/curriculum-drafts/${id}/publish`, {});
  }

  assign(
    publishedVersionId: string,
    learnerId: string,
    isRequired: boolean,
  ): Observable<LearningAssignment> {
    return this.http.post<LearningAssignment>('/api/assignments', {
      publishedVersionId,
      learnerId,
      isRequired,
    });
  }

  getAssignments(): Observable<LearningAssignment[]> {
    return this.http.get<LearningAssignment[]>('/api/learning/assignments');
  }

  getCourse(versionId: string, courseId: string): Observable<CourseView> {
    return this.http.get<CourseView>(`/api/learning/versions/${versionId}/courses/${courseId}`);
  }

  getLesson(versionId: string, courseId: string, lessonId: string): Observable<LessonView> {
    return this.http.get<LessonView>(
      `/api/learning/versions/${versionId}/courses/${courseId}/lessons/${lessonId}`,
    );
  }
}
