import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { currentMonthKey } from '../utils/month-key.util';

/**
 * Shared "which month am I looking at" state so the Dashboard and Transactions
 * tabs stay on the same month — navigating in one is reflected in the other.
 */
@Injectable({ providedIn: 'root' })
export class SelectedMonthService {
  private readonly subject = new BehaviorSubject<string>(currentMonthKey());
  readonly monthKey$ = this.subject.asObservable();

  get value(): string {
    return this.subject.value;
  }

  select(monthKey: string): void {
    if (this.subject.value !== monthKey) {
      this.subject.next(monthKey);
    }
  }
}
