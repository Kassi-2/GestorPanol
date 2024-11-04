import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTermSource = new BehaviorSubject<string>('');
  public searchTerm$ = this.searchTermSource.asObservable();
  /**
   * Recibe el término que se desea buscar devuelve en tiempo real los usuarios que coincida.
   *
   * @param {string} term
   * @memberof SearchService
   */
  updateSearchTerm(term: string) {
    this.searchTermSource.next(term);
  }
}
