import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PerformanceBudgetAdapter } from 'components';

@Component({
  selector: 'app-performance-budget-page',
  templateUrl: './performance-budget-page.component.html',
  styleUrl: './performance-budget-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceBudgetPageComponent {
  protected readonly performanceBudget = inject(PerformanceBudgetAdapter);
}
