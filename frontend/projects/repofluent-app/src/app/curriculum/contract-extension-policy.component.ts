import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ContractExtension } from 'api';

@Component({
  selector: 'app-contract-extension-policy',
  templateUrl: './contract-extension-policy.component.html',
  styleUrl: './contract-extension-policy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractExtensionPolicyComponent {
  readonly extensions = input.required<ContractExtension[]>();

  protected extensionKeys(data: Record<string, unknown>): string[] {
    return Object.keys(data).sort();
  }
}
