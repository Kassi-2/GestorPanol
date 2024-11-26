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
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

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

   /**
  * Función que muestra una alerta para confirmar o no la exportación del listado de prestamos finalizados, incluyendo el termino
  * de busqueda en caso de haber filtado.
  *
  * @memberof LendingFinishComponent
  */
   public exportPdf(){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger me-2"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "¿Estás seguro?",
      html: this.searchTerm 
      ? `¡Estás a punto de exportar la lista de préstamos pendientes!<br>Filtrado por la busqueda: ${this.searchTerm}` 
      : "¡Estás a punto de exportar la lista de préstamos pendientes!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, estoy seguro",
      cancelButtonText: "No, no estoy seguro",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.generatePdf()
        swalWithBootstrapButtons.fire({
          title: "¡PDF exportado!",
          text: "La lista de préstamos pendientes fue exportada con éxito.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          text: "La lista de préstamos pendientes no fue exportada.",
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
   * @memberof LendingFinishComponent
   */
   public generatePdf() {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Lista de préstamos pendientes', 14, 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if(this.searchTerm){
      doc.text('Filtrado por la busqueda: '+this.searchTerm, 14, 20);
    }
  // agregar filtrado de fecha


    // agregar filtrado de fecha

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

    // todas las promesas se resuelven antes de generar el PDF
    Promise.all(tableDataPromises).then((tableData) => {
        const tableHeaders = [['Id', 'Nombre del prestatario', 'Fecha', 'Profesor Asignado', 'Productos']];

        autoTable(doc, {
            head: tableHeaders,
            body: tableData,
            startY: this.searchTerm? 25 : 20,
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

        doc.save(`prestamos-pendientes-${formattedDate}.pdf`);
    });
  }

}
