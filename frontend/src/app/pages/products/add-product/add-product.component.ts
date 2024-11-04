import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Product, NewProduct } from '../../../core/models/product.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    NgbPopover,
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  providers: [ProductService],
})
export class AddProductComponent implements OnInit {

  public products: Product[] = [
    {
      id: 0,
      name: '',
      description: '',
      stock: 0,
      criticalStock: 0,
      state: true,
      fungible: false,
    },
  ];

  private subscription: Subscription = new Subscription();
  public userForm!: FormGroup;
  isFungible: boolean = false;
  succesfulEntry: boolean = true;

  /**
   * Crea una instancia de AddProductComponent.
   *
   * @param {FormBuilder} fb
   * @param {ProductService} productService
   * @memberof AddProductComponent
   */
  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.userForm = new FormGroup({
      idProduct: new FormControl(),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(null),
      stock: new FormControl('', [Validators.min(0)]),
      criticalStock: new FormControl('', [Validators.required]),
      isFungible: new FormControl(false),
    });
  }

  /**
   *  Verifica que si el nombre no es válido o si posiciona el mouse dentro del input y luego sale, marque la casilla con un error diciendo que tiene que ingresar un valor.
   *
   * @readonly
   * @memberof AddProductComponent
   */
  get notValidName() {
    return (
      this.userForm.get('name')?.invalid && this.userForm.get('name')?.touched
    );
  }

  /**
   * Verifica si el stock crítico no es válido o si posiciona el mouse dentro del input y luego sale, marque la casilla con un error diciendo que tiene que ingresar un valor.
   *
   * @readonly
   * @memberof AddProductComponent
   */
  get notValidCriticalStock() {
    return (
      this.userForm.get('criticalStock')?.invalid &&
      this.userForm.get('criticalStock')?.touched
    );
  }

  /**
   * Función que evita que se ingresen números negativos en un input.
   *
   * @param {KeyboardEvent} event
   * @memberof AddProductComponent
   */
  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === '+') {
      event.preventDefault();
    }
  }
  
  /**
   * Función para cerrar el modal y formatear el formulario.
   *
   * @memberof AddProductComponent
   */
  closeModal() {
    this.userForm.reset();
  }

  /**
   * Función para almacenar la información del formulario. Primero verifica si se rellenaron las casillas obligatorias, luego se llama al servicio productService para obtener el último
   * ID utilizado, para así sumarle 1 y almacenarlo como el ID del nuevo producto. Luego obtiene los valores del formulario, verifica que el stock -si no se ingresa nada- sea 0, y luego
   * guarda los valores nuevos en el producto temporal. Finalmente, envía al servicio el nuevo producto y si existe uno con el mismo nombre, manda un mensaje de error. Luego, se resetea
   * el formulario.
   *
   * @return {*}
   * @memberof AddProductComponent
   */
  onSubmit(): any {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    const formValues = this.userForm.value;

    const stockValue =
      formValues.stock === null || formValues.stock === ''
        ? 0
        : Number(formValues.stock);

    const newProduct: NewProduct = {
      name: formValues.name,
      description: formValues.description ?? null,
      stock: stockValue,
      criticalStock: formValues.criticalStock,
      fungible: formValues.isFungible ?? false,
    };

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    this.subscription.add(
      this.productService.addProduct(newProduct).subscribe({
        next: (response) => {
          swalWithBootstrapButtons.fire({
            title: '¡Agregado!',
            text: 'El producto ha sido agregado exitosamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });

          this.userForm.reset({
            idProduct: null,
            name: '',
            description: null,
            stock: null,
            criticalStock: null,
            fungible: false,
          });

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          swalWithBootstrapButtons.fire({
            title: 'Error',
            text: 'El producto no se ha agregado. El nombre del producto está repetido u ocurrió un error.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      })
    );
  }
}