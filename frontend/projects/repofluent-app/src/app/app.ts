import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DevPersonaService, Persona } from 'api';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly personas = inject(DevPersonaService);

  protected setPersona(event: Event): void {
    this.personas.set((event.target as HTMLSelectElement).value as Persona);
  }
}
