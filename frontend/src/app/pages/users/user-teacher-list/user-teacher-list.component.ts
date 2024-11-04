import { SearchService } from './../../../core/services/search.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User, UserTeacher } from '../../../core/models/user.interface';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-teacher-list',
  standalone: true,
  imports: [UserOptionsComponent, NgbPagination],
  templateUrl: './user-teacher-list.component.html',
  styleUrl: './user-teacher-list.component.css',
  providers: [UserService],
})
export class UserTeacherListComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllTeachers();
    this.searchService.searchTerm$.subscribe((term: string) => {
      this.filteredTeacher = this.teachers.filter(
        (teachers) =>
          teachers.name.toLowerCase().includes(term.toLowerCase()) ||
          teachers.rut.includes(term)
      );
    });
  }
  ngOnDestroy(): void {}

  public page = 1;
  public pageSize = 15;
  public user!: User;
  public teachers: UserTeacher[] = [];
  public filteredTeacher: UserTeacher[] = [];
  /**
   *Función que recibe del servicio todos los usuarios de tipo Profesor activos para luego guardarlos y listarlos.
   *
   * @private
   * @memberof UserTeacherListComponent
   */
  private getAllTeachers() {
    this.userService.getAllTeachers().subscribe((teachers: UserTeacher[]) => {
      this.teachers = teachers;
      this.filteredTeacher = teachers;
    });
  }
}
