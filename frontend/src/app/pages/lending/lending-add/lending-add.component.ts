import { SearchService } from './../../../core/services/search.service';
import {
  contains,
  Lending,
  LendingProduct,
  newLending,
} from './../../../core/models/lending.interface';
import { ProductService } from './../../../core/services/product.service';
import { LendingService } from './../../../core/services/lending.service';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  UserStudent,
  UserAssitant,
  UserTeacher,
  User,
} from '../../../core/models/user.interface';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Degree } from '../../../core/models/degree.interface';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.interface';
import { UserService } from '../../../core/services/user.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-lending-add',
  standalone: true,
  imports: [
    HttpClientModule,
    RouterModule,
    NgbPagination,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './lending-add.component.html',
  styleUrls: ['./lending-add.component.css'],
})
export class LendingAddComponent implements OnInit {
  currentStep: number = 1;
  public pageTeachers = 1;
  public pageAssistants = 1;
  public pageStudents = 1;
  public pageProducts = 1;
  public pageSize = 15;
  selectedUserType: string = 'student';
  selectedUser: User | null = null;
  user!: User;
  students!: UserStudent[];
  degrees!: Degree[];
  filteredStudents: UserStudent[] = [];
  filteredTeachers: UserTeacher[] = [];
  filteredAssistants: UserAssitant[] = [];
  teachers!: UserTeacher[];
  assistants!: UserAssitant[];
  searchTermUsers: string = '';
  searchTermProducts: string = '';
  products: Product[] = [];
  contains: contains[] = [];
  selectedTeacher: User | null = null;
  comments: string = '';
  lending!: newLending;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private LendingService: LendingService,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.LendingService.getCurrentStep().subscribe((step: number) => {
      this.currentStep = step;
    });

    this.LendingService.getSelectedUser().subscribe(
      (savedUser: User | null) => {
        if (!this.selectedUser && savedUser) {
          this.selectedUser = savedUser;
        } else if (!savedUser) {
          this.selectedUser = null;
        }
      }
    );

    this.LendingService.getLastLending().subscribe(
      (value: contains[] | null) => {
        if (value) {
          this.contains = value;
        } else {
          this.contains = [];
        }
      }
    );

    this.subscriptions.add(this.getAllStudents());
    this.subscriptions.add(this.getAllTeachers());
    this.subscriptions.add(this.getAllAssistants());
    this.subscriptions.add(this.getAllDegrees());
    this.subscriptions.add(this.getProducts());
  }
  /**
   * Función para obtener los productos almacenados.
   *
   * @return {*}  {Product[]}
   * @memberof LendingAddComponent
   */
  filteredList(): Product[] {
    const filteredProducts = this.products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(this.searchTermProducts.toLowerCase()) ||
        product.id.toString().includes(this.searchTermProducts.toLowerCase())
    );
    return filteredProducts;
  }
  /**
   * Función para buscar el stock de un producto según su ID.
   *
   * @param {number} productId
   * @return {*}  {number}
   * @memberof LendingAddComponent
   */
  getQuantity(productId: number): number {
    const item = this.contains.find((c) => c.productId === productId);
    return item ? item.amount : 0;
  }
  /**
   * Función que incrementa el valor del stock de un producto en específico.
   *
   * @param {number} productId
   * @param {number} stock
   * @memberof LendingAddComponent
   */
  incrementQuantity(productId: number, stock: number) {
    let productContains = this.contains.find((q) => q.productId === productId);

    if (productContains) {
      if (productContains.amount < stock + productContains.amount) {
        productContains.amount += 1;
        this.updateVisualStock(productId, -1);
      }
    } else {
      if (stock > 0) {
        this.contains.push({
          productId: productId,
          amount: 1,
        });
        this.updateVisualStock(productId, -1);
      }
    }

    this.LendingService.setContains(this.contains);
  }
  /**
   * Función que decrementa el stock de un producto en específico.
   *
   * @param {number} productId
   * @memberof LendingAddComponent
   */
  decrementQuantity(productId: number) {
    let productContains = this.contains.find((q) => q.productId === productId);

    if (productContains && productContains.amount > 0) {
      productContains.amount -= 1;
      this.updateVisualStock(productId, 1);
    }

    if (productContains?.amount === 0) {
      this.contains = this.contains.filter((q) => q.productId !== productId);
    }

    this.LendingService.setContains(this.contains);
  }
  /**
   * Función para actualizar el stock visual del producto.
   *
   * @param {number} productId
   * @param {number} change
   * @memberof LendingAddComponent
   */
  updateVisualStock(productId: number, change: number) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      product.stock += change;
    }
  }
  /**
   * Función para verificar si el usuario ha seleccionado productos para poder seguir al siguiente paso en la creación del préstamo.
   *
   * @return {*}  {boolean}
   * @memberof LendingAddComponent
   */
  hasSelectedProduct(): boolean {
    return this.contains.some((item) => item.amount >= 0);
  }
  /**
   * Función para obtener los productos registrados en la base de datos.
   *
   * @memberof LendingAddComponent
   */
  getProducts(): void {
    this.productService
      .getProducts()
      .subscribe((products: Product[]) => {
        this.products = products;
      });
  }
  /**
   * Función para almacenar el usuario seleccionado.
   *
   * @param {User} user
   * @memberof LendingAddComponent
   */
  selectUser(user: User) {
    this.selectedUser = user;
    this.LendingService.setSelectedUser(user);
  }
  /**
   * Función para almacenar el profesor seleccionado.
   *
   * @param {UserTeacher} teacher
   * @memberof LendingAddComponent
   */
  selectTeacher(teacher: UserTeacher) {
    this.selectedTeacher = teacher;
  }
  /**
   * Función para almacenar el tipo de usuario seleccionado.
   *
   * @param {string} type
   * @memberof LendingAddComponent
   */
  selectUserType(type: string) {
    this.selectedUserType = type;
  }
  /**
   * Función que verifica que el stock ingresado manualmente esté dentro de lo permitido. Luego, lo almacena.
   *
   * @param {Event} event
   * @param {number} productId
   * @param {number} stock
   * @memberof LendingAddComponent
   */
  onQuantityInput(event: Event, productId: number, stock: number): void {
    const input = event.target as HTMLInputElement;
    let newQuantity = input.valueAsNumber;

    if (isNaN(newQuantity)) {
      newQuantity = 0;
    } else if (newQuantity < 0) {
      newQuantity = 0;
    } else if (newQuantity > stock) {
      Swal.fire({
        title: 'Error',
        text: 'La cantidad ingresada excede el stock disponible.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      });
      newQuantity = stock;
      input.value = stock.toString();
    }

    const productContains = this.contains.find(
      (q) => q.productId === productId
    );

    if (productContains) {
      const previousQuantity = productContains.amount;
      const quantityChange = newQuantity - previousQuantity;

      if (newQuantity <= stock) {
        productContains.amount = newQuantity;

        const product = this.products.find((p) => p.id === productId);
        if (product) {
          product.stock -= quantityChange;
        }
      }
    } else {
      if (newQuantity <= stock) {
        this.contains.push({ productId, amount: newQuantity });

        const product = this.products.find((p) => p.id === productId);
        if (product) {
          product.stock -= newQuantity;
        }
      }
    }

    this.LendingService.setContains(this.contains);
  }
  /**
   * Función que obtiene la carrera según el código.
   *
   * @param {string} code
   * @return {*}
   * @memberof LendingAddComponent
   */
  getDegree(code: string) {
    if (!this.degrees) {
      return 'Desconocido';
    }
    const degree = this.degrees.find((d) => d.code === code);
    return degree?.name || 'Desconocido';
  }
  /**
   * Función que almacena todos los usuarios registrados de tipo estudiante.
   *
   * @private
   * @memberof LendingAddComponent
   */
  private getAllStudents() {
    this.userService.getAllStudents().subscribe((students: UserStudent[]) => {
      this.students = students;
      this.filteredStudents = students;
    });
  }
  /**
   * Función que almacena todos los usuarios registrados de tipo profesor.
   *
   * @private
   * @memberof LendingAddComponent
   */
  private getAllTeachers() {
    this.userService.getAllTeachers().subscribe((teachers: UserTeacher[]) => {
      this.teachers = teachers;
      this.filteredTeachers = teachers;
    });
  }
  /**
   * Función que almacena todos los usuarios registrados de tipo asistente.
   *
   * @private
   * @memberof LendingAddComponent
   */
  private getAllAssistants() {
    this.userService
      .getAllAssistants()
      .subscribe((assistants: UserAssitant[]) => {
        this.assistants = assistants;
        this.filteredAssistants = assistants;
      });
  }
  /**
   * Función para obtener todas las carreras registradas.
   *
   * @private
   * @memberof LendingAddComponent
   */
  private getAllDegrees() {
    this.userService.getAllDegrees().subscribe((degrees: Degree[]) => {
      this.degrees = degrees;
    });
  }
  /**
   * Función para avanzar un paso en la creación de un préstamo.
   *
   * @memberof LendingAddComponent
   */
  stepUp() {
    this.currentStep++;
    this.searchTermProducts = '';
    this.searchTermUsers = '';
    this.LendingService.setCurrentStep(this.currentStep);
  }
  /**
   * Función para retroceder un paso en la creación de un préstamo.
   *
   * @memberof LendingAddComponent
   */
  stepDown() {
    this.currentStep--;
    this.LendingService.setCurrentStep(this.currentStep);
  }
  /**
   * Función para verificar la creación del préstamo y lo envía al backend para almacenarlo en la base de datos mediante el servicio.
   *
   * @return {*}
   * @memberof LendingAddComponent
   */
  endAddLending() {
    if (!this.selectedUser) {
      console.error('No user selected.');
      return;
    }

    if (this.selectedTeacher != undefined) {
      this.lending = {
        comments: this.comments,
        BorrowerId: this.selectedUser.id,
        teacherId: this.selectedTeacher?.id,
        products: this.contains,
      };
    } else {
      this.lending = {
        comments: this.comments,
        BorrowerId: this.selectedUser.id,
        teacherId: null,
        products: this.contains,
      };
    }

    this.currentStep = 1;

    console.log(this.lending);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    this.LendingService.addLending(this.lending).subscribe({
      next: () => {
        swalWithBootstrapButtons.fire({
          title: '¡Préstamo creado!',
          text: 'El préstamo ha sido creado con éxito.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        this.initializeLendingForm();
        setTimeout(() => {
          window.location.reload()
        }, 1500);
      },
      error: (error) => {
        swalWithBootstrapButtons.fire({
          title: 'Error',
          text: 'El préstamo no se ha guardado, revise nuevamente la información ingresada o solicite ayuda.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });

        console.log(error);
      },
    });
  }
  /**
   * Función para buscar según el tipo de usuario en la lista de usuarios.
   *
   * @memberof LendingAddComponent
   */
  onSearch() {
    const searchTermLower = this.searchTermUsers.toLowerCase();

    if (this.selectedUserType === 'student') {
      this.filteredStudents = this.students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTermLower) ||
          student.rut.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.selectedUserType === 'teacher') {
      this.filteredTeachers = this.teachers.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTermLower) ||
          teacher.rut.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.selectedUserType === 'assistant') {
      this.filteredAssistants = this.assistants.filter(
        (assistant) =>
          assistant.name.toLowerCase().includes(searchTermLower) ||
          assistant.rut.toLowerCase().includes(searchTermLower)
      );
    }

    this.pageAssistants = 1;
    this.pageStudents = 1;
    this.pageTeachers = 1;
  }

  /**
   * Función para obtener la información de un producto mediante su ID.
   *
   * @param {number} productId
   * @return {*}  {(Product | undefined)}
   * @memberof LendingAddComponent
   */
  getProductById(productId: number): Product | undefined {
    return this.products.find((product) => product.id === productId);
  }

  /**
   * Función para resetear las variables usadas.
   *
   * @memberof LendingAddComponent
   */
  initializeLendingForm() {
    this.currentStep = 1;
    this.comments = '';
    this.selectedUser = null;
    this.selectedTeacher = null;
    this.contains = [];
    this.LendingService.setContains(null);
    this.LendingService.setSelectedUser(null);
  }
  /**
   * Función para cancelar el proceso de creación del préstamo y reiniciar las variables.
   *
   * @memberof LendingAddComponent
   */
  cancel() {
    this.initializeLendingForm();
    this.LendingService.setCurrentStep(1);
  }
}
