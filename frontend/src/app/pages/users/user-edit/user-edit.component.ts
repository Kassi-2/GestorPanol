import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
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
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { Degree } from '../../../core/models/degree.interface';
import { User, UserEdit } from '../../../core/models/user.interface';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css',
  providers: [UserService],
})
export class UserEditComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllDegrees();
  }
  ngOnDestroy(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.patchFormValues(this.user);
      this.cdr.detectChanges();
    }
  }

  @Input() user!: User;
  public degrees!: Degree[];
  public userForm: FormGroup = new FormGroup({
    rut: new FormControl('', [
      Validators.required,
      Validators.pattern('^\\d{7,8}-[\\dkK]$'),
      checkRunValidator(),
    ]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    mail: new FormControl('', [Validators.email]),
    phoneNumber: new FormControl(),
    degree: new FormControl(),
    role: new FormControl(),
  });
  /**
   * Función que verifica si el rut ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidRut() {
    return (
      this.userForm.get('rut')?.invalid && this.userForm.get('rut')?.touched
    );
  }
  /**
   * Función que verifica si el nombre ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidName() {
    return (
      this.userForm.get('name')?.invalid && this.userForm.get('name')?.touched
    );
  }
  /**
   * Función que verifica si el tipo ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidType() {
    return (
      this.userForm.get('type')?.invalid && this.userForm.get('type')?.touched
    );
  }
  /**
   * Función que verifica si el mail ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidMail() {
    return (
      this.userForm.get('mail')?.invalid && this.userForm.get('mail')?.touched
    );
  }
  /**
   * Función que verifica si el número de teléfono ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidPhoneNumber() {
    return (
      this.userForm.get('phoneNumber')?.invalid &&
      this.userForm.get('phoneNumber')?.touched
    );
  }
  /**
   * Función que verifica si la carrera ingresada no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidDegree() {
    return (
      this.userForm.get('degree')?.invalid &&
      this.userForm.get('degree')?.touched
    );
  }
  /**
   * Función que verifica si el rol ingresado no es válido para marcarlo como tocado.
   *
   * @readonly
   * @memberof UserEditComponent
   */
  get notValidRole() {
    return (
      this.userForm.get('role')?.invalid && this.userForm.get('role')?.touched
    );
  }
  /**
   * Función que recopila la información ingresada en el formulario y envía al servicio el la información para que lo actualice en la base de datos. Envía un mensaje de error si ocurre o de éxito.
   *
   * @memberof UserEditComponent
   */
  public edit() {
    const user: UserEdit = {
      rut: this.userForm.get('rut')?.value,
      name: this.userForm.get('name')?.value,
      type: this.userForm.get('type')?.value,
      mail: this.userForm.get('mail')?.value,
      phoneNumber: Number(this.userForm.get('phoneNumber')?.value),
      degree: this.userForm.get('degree')?.value,
      role: this.userForm.get('role')?.value,
    };

    this.userService.updateUser(this.user.id, user).subscribe({
      next: (result) => {
        this.clearForm();
        window.location.reload();
      },
      error: (error) => {
        alert(error.error.message);
        window.location.reload();
      },
    });
  }

  /**
   * Función que solicita al servicio las carreras activas registradas en la base de datos.
   *
   * @private
   * @memberof UserEditComponent
   */
  private getAllDegrees() {
    this.userService.getAllDegrees().subscribe((degrees: Degree[]) => {
      this.degrees = degrees;
    });
  }
  /**
   * Función que almacena la información ingresada por el usuario temporalmente.
   *
   * @private
   * @param {User} user
   * @memberof UserEditComponent
   */
  private patchFormValues(user: User): void {
    this.userForm.patchValue({
      rut: user.rut,
      name: user.name,
      type: user.type,
      mail: user.mail,
      phoneNumber:
        user.phoneNumber && user.phoneNumber !== 0 ? user.phoneNumber : '',
      degree: user.student?.codeDegree,
      role: user.assistant?.role,
    });
  }
  /**
   * Función que limpia el formulario.
   *
   * @memberof UserEditComponent
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
   * Función que recibe la información de una carrera en específico según el código de la carrera.
   *
   * @param {string} code
   * @return {*}
   * @memberof UserEditComponent
   */
  public getDegree(code: string) {
    const degree = this.degrees.find((d) => d.code == code);
    return degree?.name;
  }
}
/**
 * Función que verifica la validación del rut ingresado.
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