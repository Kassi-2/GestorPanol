import { SearchService } from './../../../core/services/search.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Assistant,
  User,
  UserAssitant,
} from '../../../core/models/user.interface';
import { UserService } from '../../../core/services/user.service';
import { UserOptionsComponent } from '../user-options/user-options.component';
import Swal from 'sweetalert2';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { UserEditComponent } from "../user-edit/user-edit.component";

@Component({
  selector: 'app-user-assistant-list',
  standalone: true,
  imports: [UserOptionsComponent, NgbPagination, UserEditComponent],
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
   * Función que recibe el id de un usuario de tipo Asistente que se desea eliminar. Se crea una ventana de confirmación y se solicita al servicio la eliminación del usuario según el id enviado. Envía un mensaje de éxito o de error según sea necesario.
   *
   * @param {number} id
   * @memberof UserAssistantListComponent
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
   * Función que recibe el id de un usuario y envía al servicio la información del usuario a editar.
   *
   * @param {number} id
   * @memberof UserAssistantListComponent
   */
  public editUser(id: number) {
    this.userService.getUserById(id).subscribe((user: User) => {
      this.user = user;
    });
  }
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

  /**
   *Función que genera el archivo pdf del listado de asistentes, incluyendo el filtrado realizado en este.
   *
   * @memberof UserTeacherListComponent
   */
   public generatePdf() {
    const doc = new jsPDF();
    doc.text('Lista de Asistentes', 14, 10);

    const tableData = this.filteredAssistant.map(assistant => [
      assistant.rut,
      assistant.name,
      assistant.assistant.role,
      `${assistant.mail}${assistant.phoneNumber ? `\n+56 ${assistant.phoneNumber}` : ''}`
    ]);

    const tableHeaders = [['Rut', 'Nombre', 'Cargo', 'Contactos']];

    autoTable(doc,{
      head: tableHeaders,
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: {
        fillColor: [247, 145, 35],
        valign: 'middle',
      },
    })

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    doc.save(`lista-asistentes-${formattedDate}.pdf`);
  }
}
