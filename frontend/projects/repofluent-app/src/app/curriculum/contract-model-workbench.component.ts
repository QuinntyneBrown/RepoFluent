import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Assessment, CurriculumPackage } from 'api';

@Component({
  selector: 'app-contract-model-workbench',
  templateUrl: './contract-model-workbench.component.html',
  styleUrl: './contract-model-workbench.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractModelWorkbenchComponent {
  readonly package = input.required<CurriculumPackage>();

  protected titleCase(value: string): string {
    const label = value.replaceAll('-', ' ');
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  }

  protected architectureName(identifier: string): string {
    for (const system of this.package().systems) {
      if (system.id === identifier) return system.name;
      const subsystem = system.subsystems.find((item) => item.id === identifier);
      if (subsystem) return subsystem.name;
    }
    return identifier;
  }

  protected itemTypes(assessment: Assessment): string[] {
    return [
      ...new Set(
        assessment.pools.flatMap((pool) => pool.items.map((item) => this.titleCase(item.type))),
      ),
    ];
  }

  protected protectedItemCount(assessment: Assessment): number {
    return assessment.pools
      .flatMap((pool) => pool.items)
      .filter((item) => item.answer.visibility === 'protected').length;
  }

  protected stableEntityCount(): number {
    const packageBody = this.package();
    let count =
      packageBody.sourceSnapshot.repositories.length +
      packageBody.relationships.length +
      packageBody.systems.length +
      packageBody.systems.reduce((total, system) => total + system.subsystems.length, 0);

    for (const course of packageBody.courses) {
      count += 1 + course.objectives.length + course.modules.length;
      for (const module of course.modules) {
        count += module.lessons.length;
        count += module.lessons.reduce((total, lesson) => total + lesson.objectives.length, 0);
      }
    }

    for (const assessment of packageBody.assessments) {
      count += 1 + assessment.pools.length;
      count += assessment.pools.reduce((total, pool) => total + pool.items.length, 0);
    }

    return count;
  }
}
