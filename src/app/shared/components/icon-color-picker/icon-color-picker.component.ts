import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from '../../../core/utils/category-presets';

@Component({
  selector: 'app-icon-color-picker',
  templateUrl: './icon-color-picker.component.html',
  styleUrls: ['./icon-color-picker.component.scss'],
  standalone: false,
})
export class IconColorPickerComponent {
  @Input() selectedIcon: string | null = DEFAULT_CATEGORY_ICON;
  @Input() selectedColor: string | null = DEFAULT_CATEGORY_COLOR;
  @Output() iconChange = new EventEmitter<string>();
  @Output() colorChange = new EventEmitter<string>();

  readonly icons = CATEGORY_ICONS;
  readonly colors = CATEGORY_COLORS;

  pickIcon(icon: string): void {
    this.iconChange.emit(icon);
  }

  pickColor(color: string): void {
    this.colorChange.emit(color);
  }
}
