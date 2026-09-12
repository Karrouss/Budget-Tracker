import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Lets any entry point (dashboard card, tab-bar FAB, ...) tell the dashboard to reload. */
@Injectable({ providedIn: 'root' })
export class DashboardRefreshService {
  private readonly subject = new Subject<void>();
  readonly changes$ = this.subject.asObservable();

  notify(): void {
    this.subject.next();
  }
}
