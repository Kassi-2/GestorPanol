import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lending } from './../../../core/models/lending.interface';
import Swal from 'sweetalert2';
import { LendingService } from './../../../core/services/lending.service';
import { User,UserTeacher } from './../../../core/models/user.interface';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { LendingOptionsComponent } from '../lending-options/lending-options.component';
import { UserService } from '../../../core/services/user.service';
import { HttpClientModule } from '@angular/common/http';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-lending-finish',
  standalone: true,
  imports: [LendingOptionsComponent, CommonModule, FormsModule, NgbPagination, HttpClientModule],
  templateUrl: './lending-finish.component.html',
  styleUrl: './lending-finish.component.css'
})


export class LendingFinishComponent {
  selectedLending: any;
  finishLending: any;
  searchTerm: string = '';
  lending: Lending[] = [];
  teachers: User[] = [];
  selectedDate: string = '';
  inputValue: string = '';
  showList: boolean = false
  public page = 1;
  public pageSize = 10;
  public pageLending = 1;
  public pageSizeLending = 10;


  constructor(private lendingService: LendingService, private userService: UserService) {}

  ngOnInit() {
    this.getLending();
  }

  // Función para poder ocultar los prestamos finalizados
  closeLendingList() {
    this.showList = false;
  }

  // Función para poder mandar la informacion del input a la funcion handleSubmit
  onEnterPress() {
    this.handleSubmit();
  }

  // Función para poder ver prestamos finalizados por una busqueda profunda
  handleSubmit() {
    if (this.inputValue.trim()) {
      console.log('Texto enviado:', this.inputValue);
      this.lendingService.getFilteredLendings(this.inputValue).subscribe(
        (lending: Lending[]) => {
          this.lending = lending;
          this.showList = true;
        },
        (error) => {
          console.error('Error al obtener los préstamos filtrados:', error);
        }
      );
      this.inputValue = '';
    } else {
      console.log('Por favor, ingresa un valor.');
    }
  }

  // Función para poder ver los prestamos finalizados filtrados por nombre
  filteredList(): Lending[] {
    const filteredLendings = this.lending.filter(
      (lending) =>
        lending.borrower.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return filteredLendings;
  }

  // Funcion para poder mostrar prestamos finalizados por fecha
  selectDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    const date = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    this.lendingService.lendingForDate(date).subscribe((lending: Lending[]) => {
      this.lending = lending;
    });
  }

  // Funcion para poder mostrar todos los prestamos finalizados
  private getLending(): void {
    this.lendingService.getLendingFinish().subscribe((lending: Lending[]) => {
      this.lending = lending
      console.log(lending)
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
      console.log(this.selectedLending)
    });
  }

  // Función para poder eliminar un prestamo finalizado
  public deleteLending(idLending: number): void {
    console.log(idLending)
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

 /**
   *Función que genera el archivo pdf del listado de prestamos finalizados, incluyendo el filtrado realizado en este.
   *
   * @memberof UserTeacherListComponent
   */
   public generatePdf() {
    const doc = new jsPDF();
    doc.text('Lista de préstamos finalizados', 14, 10);

    const filteredList = this.filteredList();

    // arreglo de promesas para cargar los productos de cada prestamo
    const tableDataPromises = filteredList.map(async (lending) => {
        const isoDate = new Date(lending.date).toISOString(); // 'YYYY-MM-DDTHH:mm:ss.sssZ'
        const date = isoDate.split('T')[0]; // 'YYYY-MM-DD'
        const time = isoDate.split('T')[1].split(':'); // 'HH:mm:ss.sssZ'
        const formattedDate = `${date.split('-')[2]}/${date.split('-')[1]}/${date.split('-')[0]} ${time[0]}:${time[1]}`;

        const isoDateFinalized = new Date(lending.date).toISOString(); // 'YYYY-MM-DDTHH:mm:ss.sssZ'
        const dateFinalized = isoDateFinalized.split('T')[0]; // 'YYYY-MM-DD'
        const timeFinalized = isoDateFinalized.split('T')[1].split(':'); // 'HH:mm:ss.sssZ'
        const formattedDateFinalized = `${dateFinalized.split('-')[2]}/${dateFinalized.split('-')[1]}/${dateFinalized.split('-')[0]} ${timeFinalized[0]}:${timeFinalized[1]}`;

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
            formattedDateFinalized,
            lending.teacherId ? lending.teacher.BorrowerId.name : "-", 
            productsList
        ];
    });

    // Esperamos a que todas las promesas se resuelvan antes de generar el PDF
    Promise.all(tableDataPromises).then((tableData) => {
        const tableHeaders = [['Id', 'Nombre del prestatario', 'Fecha de creación', 'Fecha de finalización', 'Profesor Asignado', 'Productos']];

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
              2: {
                cellWidth: 30,
              },
              3: {
                cellWidth: 30,
              },
              4: {
                cellWidth: 40,
              },
              5: {
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
