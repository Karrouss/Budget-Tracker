import { Component, Input } from '@angular/core';
import { GaugeState } from '../../../core/utils/budget-calculations';

@Component({
  selector: 'app-circular-budget-progress',
  templateUrl: './circular-budget-progress.component.html',
  styleUrls: ['./circular-budget-progress.component.scss'],
  standalone: false,
})
export class CircularBudgetProgressComponent {
  @Input() gaugePercentage = 0;
  @Input() percentage = 0;
  @Input() state: GaugeState = 'normal';
  @Input() accentColor: string | null = null;

  private readonly radius = 34;
  readonly circumference = 2 * Math.PI * this.radius;

  get dashOffset(): number {
    return this.circumference - (this.gaugePercentage / 100) * this.circumference;
  }

  /** Category's own color for a healthy gauge; always red once the budget is reached/exceeded. */
  get strokeColor(): string {
    if (this.state === 'exceeded' || this.state === 'reached') return '#ff5252';
    if (this.state === 'warning') return '#ff9f43';
    return this.accentColor ?? '#7c4dff';
  }

  get displayPercentage(): number {
    return Math.round(this.percentage);
  }
}
