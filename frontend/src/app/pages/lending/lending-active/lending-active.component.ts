import { UserTeacher } from './../../../core/models/user.interface';
import { LendingService } from './../../../core/services/lending.service';
import { Component, OnInit } from '@angular/core';
import { NgbAccordionModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { LendingOptionsComponent } from '../lending-options/lending-options.component';
import { CommonModule } from '@angular/common';
import { Lending } from './../../../core/models/lending.interface';
import { FormsModule } from '@angular/forms';
import { UserService } from './../../../core/services/user.service';
import { HttpClientModule } from '@angular/common/http';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';



@Component({
  selector: 'app-lending-active',
  standalone: true,
  imports: [LendingOptionsComponent, NgbAccordionModule, CommonModule, FormsModule, NgbPagination, HttpClientModule],
  templateUrl: './lending-active.component.html',
  styleUrl: './lending-active.component.css',
  providers: [LendingService]
})
export class LendingActiveComponent {
  selectedLending: any;
  resetLending: any;
  searchTerm: string = '';
  lending: Lending[] = [];
  teachers: UserTeacher[] = [];
  isEditMode: boolean = false;
  selectedDate: string = '';
  public page = 1;
  public pageSize = 10;



  constructor(private lendingService: LendingService, private userService: UserService) {}

  ngOnInit() {
    this.getLending();
  }

  // Funcion para poder mostrar prestamos activos por fecha
  selectDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    const date = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1}-${selectedDate.getDate()}`
    this.lendingService.lendingForDate(date).subscribe((lending: Lending[]) => {
      this.lending = lending;
    });
  }

  // Funcion para poder mostrar todos los prestamos activos
  getLending(): void {
    this.lendingService.getLending().subscribe((lending: Lending[]) => {
      this.lending = lending;
    });
  }

  // Función para poder mostrar todos los profesores
  private getAllTeachers() {
    this.userService.getAllTeachers().subscribe((teachers: UserTeacher[]) => {
      this.teachers = teachers;
    });
  }

  // Función para poder ver los prestamos activos filtrados por nombre
  filteredList(): Lending[] {
    const filteredLendings = this.lending.filter(
      (lending) =>
        lending.borrower.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return filteredLendings;
  }

  // Función para obtener el profesor asignado a un prestamos
  selectTeacher(teacher: any) {
    this.selectedLending.teacherId = teacher.rut;
    this.selectedLending.teacherName = teacher.name;
  }

  // Función para mostrar los detalles del prestamos
  openLendingDetails(id: number) {
    this.lendingService.getLendingForEdit(id).subscribe((lending: Lending[]) => {
      this.resetLending = lending;
      this.selectedLending = { ...lending };
      this.getAllTeachers();
      console.log(this.selectedLending)
    });
  }

  // Función para poder finalizar un prestamo activo
  finishLending(idLending: number, comments: string): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger me-2"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      text: "¡Estás a punto de finalizar un préstamo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, estoy seguro",
      cancelButtonText: "No, no estoy seguro",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.lendingService.lendingFinish(idLending, comments).subscribe(() => {
        this.lending = this.lending.filter(lending => lending.id !== idLending);
        swalWithBootstrapButtons.fire({
          title: "¡Finalizado!",
          text: "El préstamo fue finalizado con éxito.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        this.getLending()
      });
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "El préstamo no fue finalizado.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  /**
   *Función que genera el archivo pdf del listado de prestamos activos, incluyendo el filtrado realizado en este.
   *
   * @memberof UserTeacherListComponent
   */
   public generatePdf() {
    const doc = new jsPDF();
    doc.text('Lista de préstamos activos', 14, 10);

    const filteredList = this.filteredList();

    // arreglo de promesas para cargar los productos de cada prestamo
    const tableDataPromises = filteredList.map(async (lending) => {
        const isoDate = new Date(lending.date).toISOString(); // 'YYYY-MM-DDTHH:mm:ss.sssZ'
        const date = isoDate.split('T')[0]; // 'YYYY-MM-DD'
        const time = isoDate.split('T')[1].split(':'); // 'HH:mm:ss.sssZ'
        const formattedDate = `${date.split('-')[2]}/${date.split('-')[1]}/${date.split('-')[0]} ${time[0]}:${time[1]}`;

        let productsList = "-";

        // Llamada al backend para obtener los productos del prestamo
        const lendingDetails: any = await this.lendingService.getLendingForEdit(lending.id).toPromise();
        if (lendingDetails && lendingDetails.lendingProducts) {
            productsList = lendingDetails.lendingProducts.map((lendingProduct: { product: { name: any; }; amount: any; }) => 
                `${lendingProduct.product.name} - ${lendingProduct.amount}`
            ).join('\n');
        }

        // Devolver los datos de cada fila
        return [
            lending.id,
            lending.borrower.name,
            formattedDate,
            lending.teacherId ? lending.teacher.BorrowerId.name : "-", 
            productsList
        ];
    });

    // Esperamos a que todas las promesas se resuelvan antes de generar el PDF
    Promise.all(tableDataPromises).then((tableData) => {
        const tableHeaders = [['Id', 'Nombre del prestatario', 'Fecha', 'Profesor Asignado', 'Productos']];

        autoTable(doc, {
            head: tableHeaders,
            body: tableData,
            startY: 20,
            theme: 'grid',
            headStyles: {
                fillColor: [247, 145, 35],
                valign: 'middle',
            },
            columnStyles: {
              4: {
                  cellWidth: 30,
              },
            },
        });

        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        doc.save(`lista-prestamos-activos-${formattedDate}.pdf`);
    });
  }
}