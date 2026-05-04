import { BehaviorSubject, MonoTypeOperatorFunction } from 'rxjs';
import { finalize } from 'rxjs/operators';

export class LoadingState {
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this._isLoading.asObservable();

  track<T>(): MonoTypeOperatorFunction<T> {
    this._isLoading.next(true);
    return finalize(() => this._isLoading.next(false));
  }
}
