import { Injectable, signal } from '@angular/core';
import type { Persona } from './persona';

const storageKey = 'repofluent-development-persona';

@Injectable({ providedIn: 'root' })
export class DevPersonaService {
  readonly current = signal<Persona>(this.read());

  set(persona: Persona): void {
    localStorage.setItem(storageKey, persona);
    this.current.set(persona);
  }

  private read(): Persona {
    const stored = localStorage.getItem(storageKey);
    return stored === 'reviewer' ||
      stored === 'administrator' ||
      stored === 'auditor' ||
      stored === 'learner' ||
      stored === 'author'
      ? stored
      : 'author';
  }
}
