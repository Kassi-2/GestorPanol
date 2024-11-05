import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  User,
  UserAssitant,
  UserEdit,
  UserRegister,
  UserStudent,
  UserTeacher,
} from '../models/user.interface';
import { Degree } from '../models/degree.interface';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:3000/users';
  /**
   *Función que devuelve una lista de tipo Estudiante de todos los usuarios de ese tipo registrados en la base de datos.
   *
   * @return {*}  {Observable<UserStudent[]>}
   * @memberof UserService
   */
  public getAllStudents(): Observable<UserStudent[]> {
    return this.http.get<UserStudent[]>(`${this.apiUrl}/students`);
  }
  /**
   *Función que devuelve una lsita de tipo Profesor de todos los usuarios de ese tipo registrados en la base de datos.
   *
   * @return {*}  {Observable<UserTeacher[]>}
   * @memberof UserService
   */
  public getAllTeachers(): Observable<UserTeacher[]> {
    return this.http.get<UserTeacher[]>(`${this.apiUrl}/teachers`);
  }
  /**
   *Función que recibe una lista de tipo Asistente de todos los usuarios de ese tipo registrados en la base de datos.
   *
   * @return {*}  {Observable<UserAssitant[]>}
   * @memberof UserService
   */
  public getAllAssistants(): Observable<UserAssitant[]> {
    return this.http.get<UserAssitant[]>(`${this.apiUrl}/assistants`);
  }
  /**
   *Función que recibe todas las carreras registradas en la base de datos.
   *
   * @return {*}  {Observable<Degree[]>}
   * @memberof UserService
   */
  public getAllDegrees(): Observable<Degree[]> {
    const response = this.http.get<Degree[]>(`${this.apiUrl}/degrees`);
    return response;
  }
  /**
   *Función que recibe un id y devuelve la información del usuario correspondiente.
   *
   * @param {number} id
   * @return {*}  {Observable<User>}
   * @memberof UserService
   */
  public getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`);
  }
}
