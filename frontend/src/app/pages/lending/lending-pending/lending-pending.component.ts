import { Component } from '@angular/core';
import { User, UserTeacher } from './../../../core/models/user.interface';
import { Lending } from './../../../core/models/lending.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { LendingService } from '../../../core/services/lending.service';
import { UserService } from '../../../core/services/user.service';
import { LendingOptionsComponent } from '../lending-options/lending-options.component';


@Component({
  selector: 'app-lending-pending',
  standalone: true,
  imports: [LendingOptionsComponent,CommonModule, FormsModule, NgbPagination],
  templateUrl: './lending-pending.component.html',
  styleUrl: './lending-pending.component.css'
})
export class LendingPendingComponent {
  selectedLending: any;
  searchTerm: string = '';
  lending: Lending[] = [];
  teachers: User[] = [];
  selectedDate: string = '';
  public page = 1;
  public pageSize = 10;
  constructor(private lendingService: LendingService, private userService: UserService) {}

  ngOnInit() {
    this.getLending();
  }

  // Funcion para actualizar el estado del préstamo pendiente a préstamo activo
  public updateLendingPending(idLending: number): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger me-2"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "¡Estás a punto de actualizar el préstamo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, estoy seguro",
      cancelButtonText: "No, no estoy seguro",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.lendingService.updateLendingPending(idLending).subscribe(() => {
          this.lending = this.lending.filter(lending => lending.id !== idLending);
          swalWithBootstrapButtons.fire({
            title: "¡Confirmado!",
            text: "El préstamo fue actualizado.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        });
      } else if (
        result.dismiss === Swal.DismissReason.cancel

      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "El préstamo no fue actualizado.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  // Función para poder ver los prestamos eliminados filtrados por nombre
  filteredList(): Lending[] {
    const filteredLendings = this.lending.filter(
      (lending) =>
        lending.borrower.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return filteredLendings;
  }

  // Funcion para poder mostrar prestamos eliminados por fecha
  selectDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    const date = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    this.lendingService.lendingForDate(date).subscribe((lending: Lending[]) => {
      this.lending = lending;
    });
  }

  // Funcion para poder mostrar todos los prestamos eliminados
  private getLending(): void {
    this.lendingService.getLendingPending().subscribe((lending: Lending[]) => {
      this.lending = lending
    });
  }

  // Función para poder mostrar todos los profesores
  private getAllTeachers() {
    this.userService.getAllTeachers().subscribe((teachers: UserTeacher[]) => {
      this.teachers = teachers;
    });
  }

  // Función para mostrar los detalles del prestamo
  openLendingDetails(id: number) {
    this.lendingService.getLendingForEdit(id).subscribe((lending: Lending[]) => {
      this.selectedLending = { ...lending };
      this.getAllTeachers();
    });
  }
  public deleteLending(idLending: number): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger me-2"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "¡Estás a punto de eliminar un préstamo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, quiero eliminarlo",
      cancelButtonText: "No, no quiero eliminarlo",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.lendingService.deleteLending(idLending).subscribe(() => {
          this.lending = this.lending.filter(lending => lending.id !== idLending);
          swalWithBootstrapButtons.fire({
            title: "¡Eliminado!",
            text: "El préstamo fue eliminado.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        });
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "El préstamo no fue eliminado.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

}
