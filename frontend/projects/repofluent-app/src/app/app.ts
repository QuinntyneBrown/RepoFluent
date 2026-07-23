import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DevPersonaService, Persona } from 'api';
import { ExperiencePlatformAdapter, PerformanceBudgetAdapter } from 'components';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly personas = inject(DevPersonaService);
  protected readonly experiencePlatform = inject(ExperiencePlatformAdapter);
  private readonly performanceBudget = inject(PerformanceBudgetAdapter);
  private readonly router = inject(Router);
  private readonly commandDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('commandDialog');
  private readonly commandInput = viewChild.required<ElementRef<HTMLInputElement>>('commandInput');
  private readonly commandTrigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('commandTrigger');
  private commandInvoker: HTMLElement | null = null;

  constructor() {
    this.experiencePlatform.initialize();
    this.performanceBudget.initialize();
    afterNextRender(() => this.performanceBudget.markShellUsable());
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        queueMicrotask(() => {
          this.experiencePlatform.focusPrimaryHeading();
          this.performanceBudget.markShellUsable();
        });
      });
  }

  protected setPersona(event: Event): void {
    this.personas.set((event.target as HTMLSelectElement).value as Persona);
  }

  protected openCommandSearch(event?: Event): void {
    const dialog = this.commandDialog().nativeElement;
    if (dialog.open) return;

    this.commandInvoker =
      event?.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : this.commandTrigger().nativeElement;
    dialog.showModal();
    queueMicrotask(() => this.commandInput().nativeElement.focus());
  }

  protected closeCommandSearch(): void {
    this.commandDialog().nativeElement.close();
  }

  protected restoreCommandFocus(): void {
    this.commandInvoker?.focus();
    this.commandInvoker = null;
  }

  @HostListener('document:keydown', ['$event'])
  protected handleCommandShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openCommandSearch();
    }
  }
}
