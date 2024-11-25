import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert.interface';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:3000/alerts';

  /**
   * Crea una nueva alerta con fecha predefinida.
   * Envía una solicitud POST al servidor para guardar la alerta.
   *
   * @return {*}  {Observable<Alert>}
   * @memberof AlertService
   */
  public createAlert(): Observable<Alert> {
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      17,
      0,
      0
    );
    const alertData = {
      name: `Alerta ${now.getDate()}-${
        now.getMonth() + 1
      }-${now.getFullYear()}`,
      description: '',
      state: false,
      date: date,
    };
    return this.http.post<Alert>(`${this.apiUrl}`, alertData);
  }

  /**
   * Obtiene todas las alertas registradas en el sistema.
   * Envía una solicitud GET al servidor y devuelve una lista de alertas.
   *
   * @return {*}  {Observable<Alert[]>}
   * @memberof AlertService
   */
  public getAllAlert(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}`);
  }


  /**
   * Marca una alerta como vista mediante su id.
   * Envía una solicitud PUT al servidor para actualizar el estado de la alerta.
   *
   * @param {number} alertId
   * @return {*}  {Observable<Alert>}
   * @memberof AlertService
   */
  public markAlertAsViewed(alertId: number): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${alertId}`, {});
  }

  /**
   * Elimina una alerta del sistema mediante su id.
   * Envía una solicitud DELETE al servidor para borrar la alerta.
   *
   * @param {number} alertId
   * @return {*}  {Observable<Alert>}
   * @memberof AlertService
   */
  public deleteAlert(alertId: number): Observable<Alert> {
    return this.http.delete<Alert>(`${this.apiUrl}/${alertId}`);
  }
}