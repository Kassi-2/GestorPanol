import { Component } from '@angular/core';
import { SearchService } from '../../../core/services/search.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserAddComponent } from "../user-add/user-add.component";

@Component({
  selector: 'app-user-options',
  standalone: true,
  imports: [FormsModule, RouterLink, UserAddComponent],
  templateUrl: './user-options.component.html',
  styleUrl: './user-options.component.css',
})
export class UserOptionsComponent {
  searchTerm: string = '';

  constructor(private searchService: SearchService) {}
  /**
   * Función que envía al servicio el término de búsqueda que ingresó el usuario para listar los usuarios que coincidan con lo ingresado.
   *
   * @memberof UserOptionsComponent
   */
  onSearch() {
    this.searchService.updateSearchTerm(this.searchTerm);
  }
}
