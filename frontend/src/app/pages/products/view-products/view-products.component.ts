import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Product } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { AddProductComponent } from '../add-product/add-product.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddProductComponent,
    HttpClientModule,
    NgbPagination,
  ],
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.css'],
  providers: [ProductService],
})
export class ViewProductsComponent implements OnInit {
  public page = 1;
  public pageSize = 10;

  public forma!: FormGroup;

  selectedProductId: number | null = null;
  products: Product[] = [];
  exampleStock: number = 0;

  //Estos atributos serviran para buscar un producto según el nombre y para la paginación de la lista de productos.
  searchTerm: string = '';
  start: number = 0;
  end: number = this.pageSize;
  selectedOption: string = '';

  //Esta función constructor crea el formulario con el que se va a trabajar (para agregar o editar un producto).
  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.createForm();
  }

  // Inicializamos el formulario con valores predeterminados (formato del producto).
  createForm() {
    this.forma = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      stock: ['', Validators.min(0)],
      criticalStock: [''],
      fungible: [false],
    });
  }

  //Esta funcion obtiene los productos de la lista.
  ngOnInit(): void {
    this.getProducts();
  }

  //Esta función es para validar si el campo del nombre esta correcto, esto muestra un mensaje.
  get notValidName() {
    return this.forma.get('name')?.invalid && this.forma.get('name')?.touched;
  }

  //Esta función es para actualizar la opción seleccionada.
  selectOption(option: string) {
    this.selectedOption = option;
  }

  //Este función es para evitar que se ingrese ciertos cáracteres.
  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+') {
      event.preventDefault();
    }
  }

  //Filtrar la lista por el nombre y por ordenar productos por paginación.
  filteredList(): Product[] {
    const filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.id.toString().includes(this.searchTerm.toLowerCase())
    );
    return filteredProducts;
  }

  // Obtener todos los productos de la lista.
  getProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      console.log(products)
    });
  }

  // Eliminar un producto de la lista (muestra una alerta de confimar eliminación).
  deleteProduct(idProduct: number): void {
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
        text: `¡Estás a punto de eliminar este producto!`,
        iconHtml: `
          <div style="
            background-color: FCBF49;
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
          this.productService.deleteProduct(idProduct).subscribe({
            next: (response) => {
              swalWithBootstrapButtons.fire({
                title: '¡Eliminado!',
                text: 'El producto ha sido eliminado exitosamente.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });

              this.getProducts();
            },
          });
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'El producto no se ha eliminado.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
  }

  //Funcion que ordena la lista de productos según la opción que escogio.
  onSelected(option: string) {
    this.selectedOption = option;
    this.productService.filterListProduct(this.selectedOption).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (error) => {
        console.error(error.error.message);
      },
    });
  }

  /**
  * Función que muestra una alerta para confirmar o no la exportación del productos del invetario, incluyendo el termino
  * de busqueda en caso de haber filtado.
  *
  * @memberof ViewProductsComponent
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
      // el selected option por defecto deberia ser A-Z?
      html: this.searchTerm 
      ? `¡Estás a punto de exportar el inventario de productos!<br>Filtro aplicado: ${this.searchTerm}<br>Ordenado por: ${this.selectedOption}` 
      : `¡Estás a punto de exportar el inventario de productos!<br>Ordenado por: ${this.selectedOption}`,
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
          text: "El inventario de productos fue exportado con éxito.",
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
          text: "El inventario de productos no fue exportado.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  /**
 *Función que genera el archivo pdf del listado de productos del inventario, incluyendo el filtrado realizado en este.
  *
  * @memberof ViewProductsComponent
  */
  public generatePdf() {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Inventario de productos', 14, 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('Ordenado por: '+this.selectedOption, 14, 20)
    if(this.searchTerm){
      doc.text('Filtrado por la busqueda: '+this.searchTerm, 14, 25);
    }

    const filteredList = this.filteredList()

    const tableData = filteredList.map(product => {
      let state = '';
    
      if (product.stock > 0 && product.criticalStock < product.stock) {
        state = 'Disponible';
      } else if (product.stock > 0 && product.criticalStock >= product.stock) {
        state = 'Crítico';
      } else {
        state = 'No disponible';
      }
    
      return [
        product.id,
        product.name,
        product.stock,
        state
      ];
    });

    const tableHeaders = [['Código', 'Nombre', 'Stock', 'Estado']];

    autoTable(doc,{
      head: tableHeaders,
      body: tableData,
      startY: this.searchTerm? 30 : 25,
      theme: 'grid',
      headStyles: {
        fillColor: [247, 145, 35],
        valign: 'middle',
      },
    })

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    doc.save(`Inventario-${formattedDate}.pdf`);
  }
}
