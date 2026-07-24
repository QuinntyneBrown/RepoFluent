import { TestBed } from '@angular/core/testing';
import { DevPersonaService } from './dev-persona.service';

describe('DevPersonaService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts as the author and persists an explicit persona change', () => {
    const service = TestBed.inject(DevPersonaService);

    expect(service.current()).toBe('author');
    service.set('reviewer');

    expect(service.current()).toBe('reviewer');
    expect(localStorage.getItem('repofluent-development-persona')).toBe('reviewer');
  });

  it('restores the auditor persona for lifecycle evidence', () => {
    localStorage.setItem('repofluent-development-persona', 'auditor');

    const service = TestBed.inject(DevPersonaService);

    expect(service.current()).toBe('auditor');
  });
});
