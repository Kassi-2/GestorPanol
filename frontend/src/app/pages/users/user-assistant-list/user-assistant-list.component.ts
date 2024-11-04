import { SearchService } from './../../../core/services/search.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Assistant,
  User,
  UserAssitant,
} from '../../../core/models/user.interface';
import { UserService } from '../../../core/services/user.service';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-assistant-list',
  standalone: true,
  imports: [UserOptionsComponent, NgbPagination],
  templateUrl: './user-assistant-list.component.html',
  styleUrl: './user-assistant-list.component.css',
  providers: [UserService],
})
export class UserAssistantListComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private searchService: SearchService
  ) {}
  ngOnInit(): void {
    this.getAllAssistants();
    this.searchService.searchTerm$.subscribe((term: string) => {
      this.filteredAssistant = this.assistants.filter(
        (assistant) =>
          assistant.name.toLowerCase().includes(term.toLowerCase()) ||
          assistant.rut.includes(term)
      );
    });
  }
  ngOnDestroy(): void {}

  public user!: User;
  public assistants: UserAssitant[] = [];
  public filteredAssistant: UserAssitant[] = [];
  public page = 1;
  public pageSize = 15;

  /**
   * Función que solicita al servicio la lista de todos los usuarios de tipo Asistente activos de la base de datos.
   *
   * @memberof UserAssistantListComponent
   */
  public getAllAssistants() {
    this.userService
      .getAllAssistants()
      .subscribe((assistants: UserAssitant[]) => {
        this.assistants = assistants;
        this.filteredAssistant = assistants;
      });
  }
}
