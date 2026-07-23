import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ContractRelease } from 'api';

@Component({
  selector: 'app-contract-release-panel',
  imports: [KeyValuePipe],
  templateUrl: './contract-release-panel.component.html',
  styleUrl: './contract-release-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractReleasePanelComponent {
  readonly release = input.required<ContractRelease>();

  protected titleCase(value: string): string {
    const label = value.replaceAll('-', ' ');
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  }
}
