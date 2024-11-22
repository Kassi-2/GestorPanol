import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserRegister } from '../../../core/models/user.interface';
import { UserService } from '../../../core/services/user.service';
import { Degree } from '../../../core/models/degree.interface';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    NgbPopoverModule,
  ],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
  providers: [UserService],
})
export class UserAddComponent implements OnInit, OnDestroy {
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getAllDegrees();
  }
  ngOnDestroy(): void {}

  public degrees!: Degree[];
  public userForm: FormGroup = new FormGroup({
    rut: new FormControl('', [
      Validators.required,
      Validators.pattern('^\\d{7,8}-[\\dkK]$'),
      checkRunValidator(),
    ]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    mail: new FormControl('', Validators.email),
    phoneNumber: new FormControl(),
    degree: new FormControl(),
    role: new FormControl(),
  });
  /**
   * Función que rescata del formulario la información ingresada con el usuario y envía al servicio el usuario nuevo para que lo agregue a la base de datos.
   *
   * @memberof AddUserComponent
   */
  public register() {
    const user: UserRegister = {
      rut: this.userForm.get('rut')?.value,
      name: this.userForm.get('name')?.value,
      type: this.userForm.get('type')?.value,
      mail: this.userForm.get('mail')?.value,
      phoneNumber: Number(this.userForm.get('phoneNumber')?.value),
      degree: this.userForm.get('degree')?.value,
      role: this.userForm.get('role')?.value,
    };

    this.userService.register(user).subscribe({
      next: () => {
        window.location.reload();
        this.clearForm();
      },
      error: (error) => {
        alert(error.error.message);
        window.location.reload();
      },
    });
  }
  /**
   * Función que solicita a la base de datos un arreglo de tipo Degree con todas las carreras activas registradas en la base de datos.
   *
   * @private
   * @memberof AddUserComponent
   */
  private getAllDegrees() {
    this.userService.getAllDegrees().subscribe((degrees: Degree[]) => {
      this.degrees = degrees;
    });
  }
  /**
   * Función que verifica si el rut es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidRut() {
    return (
      this.userForm.get('rut')?.invalid && this.userForm.get('rut')?.touched
    );
  }
  /**
   * Función que verifica si el nombre es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidName() {
    return (
      this.userForm.get('name')?.invalid && this.userForm.get('name')?.touched
    );
  }
  /**
   * Función que verifica si el tipo de usuario es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidType() {
    return (
      this.userForm.get('type')?.invalid && this.userForm.get('type')?.touched
    );
  }
  /**
   * Función que verifica si el mail es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidMail() {
    return (
      this.userForm.get('mail')?.invalid && this.userForm.get('mail')?.touched
    );
  }
  /**
   * Función que verifica si el número de teléfono es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidPhoneNumber() {
    return (
      this.userForm.get('phoneNumber')?.invalid &&
      this.userForm.get('phoneNumber')?.touched
    );
  }
  /**
   * Función que verifica si la carrera es inválida para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidDegree() {
    return (
      this.userForm.get('degree')?.invalid &&
      this.userForm.get('degree')?.touched
    );
  }
  /**
   * Función que verifica si el rol es inválido para enviar una alerta.
   *
   * @readonly
   * @memberof AddUserComponent
   */
  get notValidRole() {
    return (
      this.userForm.get('role')?.invalid && this.userForm.get('role')?.touched
    );
  }
  /**
   * Función que limpia el formulario.
   *
   * @memberof AddUserComponent
   */
  public clearForm() {
    this.userForm.reset({
      rut: '',
      name: '',
      type: '',
      mail: '',
      phoneNumber: '',
      degree: '',
      role: '',
    });
  }
  /**
   * Función que busca la información de una carrera en específico según el código.
   *
   * @param {string} code
   * @return {*}
   * @memberof AddUserComponent
   */
  public getDegree(code: string) {
    const degree = this.degrees.find((d) => d.code == code);
    return degree?.name;
  }
}
/**
 * Función que verifica la validación del rut ingresado por el usuario.
 *
 * @export
 * @return {*}  {ValidatorFn}
 */
export function checkRunValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = checkRun(control.value);
    return isValid ? null : { invalidRun: true };
  };
}
/**
 * Función que verifica el formato del rut ingresado por el usuario.
 *
 * @param {string} run
 * @return {*}  {boolean}
 */
function checkRun(run: string): boolean {
  run = run.replace('-', '');

  const cdEntered = run.slice(-1).toUpperCase();
  const number = run.slice(0, -1);

  let add = 0;
  let factor = 2;
  for (let i = number.length - 1; i >= 0; i--) {
    add += parseInt(number.charAt(i)) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const cdExpected = 11 - (add % 11);
  const cdCalculated =
    cdExpected === 11 ? '0' : cdExpected === 10 ? 'K' : cdExpected.toString();

  return cdEntered === cdCalculated;
}
