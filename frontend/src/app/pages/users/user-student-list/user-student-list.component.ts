import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserOptionsComponent } from '../user-options/user-options.component';
import { UserService } from '../../../core/services/user.service';
import { User, UserStudent } from '../../../core/models/user.interface';
import { Degree } from '../../../core/models/degree.interface';
import { Subscription } from 'rxjs';
import { SearchService } from '../../../core/services/search.service';
import Swal from 'sweetalert2';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { UserEditComponent } from "../user-edit/user-edit.component";

@Component({
  selector: 'app-user-student-list',
  standalone: true,
  imports: [CommonModule, UserOptionsComponent, NgbPagination, UserEditComponent],
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
   *Función que recibe el id de un usuario de tipo estudiante, dentro crea una alerta y manda la información al servicio para que lo elimine de la base de datos. Manda un aviso si se realizó exitosamente o si ocurrió un error.
   *
   * @param {number} id
   * @memberof UserStudentListComponent
   */
   public deleteUser(id: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: '¿Estás seguro?',
        text: `¡Estás a punto de eliminar este usuario!`,
        iconHtml: `
          <div style="
            border-radius: 50%;
            width: 4rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, estoy seguro',
        cancelButtonText: 'No, cancelar',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.userService.deleteUser(id).subscribe({
            next: (response) => {
              swalWithBootstrapButtons.fire({
                title: '¡Eliminado!',
                text: 'El usuario ha sido eliminado exitosamente.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            },
          });
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'El usuario no se ha eliminado.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
  }
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
  /**
   * Función que recibe el id de un usuario de tipo Estudiante para enviar la información al servicio y lo actualice en la base de datos.
   *
   * @param {number} id
   * @memberof UserStudentListComponent
   */
  public editUser(id: number) {
    this.userService.getUserById(id).subscribe((user: User) => {
      this.user = user;
    });
  }

  /**
  * Función que muestra una alerta para confirmar o no la exportación del listado de estudiantes, incluyendo el termino
  * de busqueda en caso de haber filtado.
  *
  * @memberof UserStudentListComponent
  */
  public exportPdf(search: string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger me-2"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      html: search 
      ? `¡Estás a punto de exportar la lista de estudiantes!<br>Filtrado por la busqueda: ${search}` 
      : `¡Estás a punto de exportar la lista de estudiantes!`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, estoy seguro",
      cancelButtonText: "No, no estoy seguro",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.generatePdf(search)
        swalWithBootstrapButtons.fire({
          title: "¡PDF exportado!",
          text: "La lista de estudiantes fue exportada con éxito.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      ;
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "La lista de estudiantes no fue exportada.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  /**
   *Función que genera el archivo pdf del listado de estudiantes, incluyendo el filtrado realizado en este.
   *
   * @memberof UserStudentListComponent
   */
   public generatePdf(search: string) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Lista de estudiantes', 14, 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if(search){
      doc.text('Filtrado por la busqueda: '+search, 14, 20);
    }

    const tableData = this.filteredStudents.map(student => [
      student.rut,
      student.name,
      this.getDegree(student.student.codeDegree)!,
      `${student.mail}${student.phoneNumber ? `\n+56 ${student.phoneNumber}` : ''}`
    ]);

    const tableHeaders = [['Rut', 'Nombre', 'Carrera', 'Contactos']];

    autoTable(doc,{
      head: tableHeaders,
      body: tableData,
      startY: search? 25 : 20,
      theme: 'grid',
      headStyles: {
        fillColor: [247, 145, 35],
        valign: 'middle',
      },
    })

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    doc.save(`estudiantes-${formattedDate}.pdf`);
  }
}
