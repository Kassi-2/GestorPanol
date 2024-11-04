import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { UserService } from '../../../core/services/user.service';
import { User, UserStudent } from '../../../core/models/user.interface';
import { Degree } from '../../../core/models/degree.interface';
import { Subscription } from 'rxjs';
import { SearchService } from '../../../core/services/search.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-student-list',
  standalone: true,
  imports: [CommonModule, UserOptionsComponent, NgbPagination],
  templateUrl: './user-student-list.component.html',
  styleUrl: './user-student-list.component.css',
  providers: [UserService, SearchService],
})
export class UserStudentListComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.getAllStudents());
    this.subscriptions.add(this.getAllDegrees());

    this.searchService.searchTerm$.subscribe((term: string) => {
      this.filteredStudents = this.students.filter(
        (student) =>
          student.name.toLowerCase().includes(term.toLowerCase()) ||
          student.rut.includes(term)
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public page = 1;
  public pageSize = 15;
  public selectedUserId!: number;
  public user!: User;
  private subscriptions: Subscription = new Subscription();
  public students: UserStudent[] = [];
  public degrees!: Degree[];
  public filteredStudents: UserStudent[] = [];

  /**
   *Función busca la información de una carrera según su código.
   *
   * @param {string} code
   * @return {*}
   * @memberof UserStudentListComponent
   */
  public getDegree(code: string) {
    const degree = this.degrees.find((d) => d.code == code);
    return degree?.name;
  }
  /**
   * Función que llama al servicio para recibir una lista de los usuarios de tipo Estudiante activos de la base de datos.
   *
   * @private
   * @memberof UserStudentListComponent
   */
  private getAllStudents() {
    this.userService.getAllStudents().subscribe((students: UserStudent[]) => {
      this.students = students;
      this.filteredStudents = students;
    });
  }

  /**
   * Función que solicita al servicio todas las carreras activas registradas en la base de datos.
   *
   * @private
   * @memberof UserStudentListComponent
   */
  private getAllDegrees() {
    this.userService.getAllDegrees().subscribe((degrees: Degree[]) => {
      this.degrees = degrees;
    });
  }
}
