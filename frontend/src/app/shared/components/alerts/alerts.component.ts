import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { Alert } from '../../../core/models/alert.interface';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [HttpClientModule, CommonModule, NgbToastModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
  providers: [AlertService],
})
export class AlertsComponent implements OnInit, OnDestroy {
  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.getAllAlerts();
    this.scheduleDailyAlert();
  }
  ngOnDestroy(): void {}

  public alerts: Alert[] = [];
  public show = false;
  public alert: Alert = {
    id: 0,
    state: false,
    date: new Date(),
    name: '',
    description: '',
  };

  /**
   * Obtiene todas las alertas a través del servicio AlertService y las asigna al arreglo `alerts`.
   *
   * @private
   * @memberof AlertsComponent
   */
  private getAllAlerts() {
    this.alertService.getAllAlert().subscribe((alerts: Alert[]) => {
      console.log(alerts);
      this.alerts = alerts;
      console.log(this.alerts);
    });
  }

  /**
   * Configura un temporizador para enviar una alerta automáticamente cada día a las 17:00.
   * Realiza una verificación cada minuto para comprobar si es necesario enviar la alerta.
   *
   * @private
   * @memberof AlertsComponent
   */
  private scheduleDailyAlert() {
    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 17 && localStorage.getItem('alert') === 'false') {
        this.sendAlert();
      } else if ((currentHour < 17 && localStorage.getItem('alert') === 'true') || !localStorage.getItem('alert')) {
        localStorage.setItem('alert', 'false');
      }
    };
    setInterval(checkTime, 6000);
  }

  /**
   * Envía una alerta usando el servicio AlertService y muestra un toast de notificación.
   * Establece `hasAlertBeenSentToday` en `true` y recarga la página después de 10 segundos.
   *
   * @private
   * @memberof AlertsComponent
   */
  private sendAlert() {
    this.alertService.createAlert().subscribe({
      next: (result) => {
        localStorage.setItem('alert', 'true');
        this.alert = result;
        const toastLiveExample = document.getElementById('toast');
        if (result.state == false) {
          const toastBootstrap = (
            window as any
          ).bootstrap.Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();
        }
        setTimeout(() => {
          window.location.reload();
        }, 10000);
      },
      error: (error) => {
        console.error('Error al crear la alerta:', error);
      },
    });
  }

  /**
   * Restablece el indicador `hasAlertBeenSentToday` a medianoche para permitir una nueva alerta al día siguiente.
   *
   * @private
   * @memberof AlertsComponent
   */
  /**
   * Calcula el número de días transcurridos desde la fecha de una alerta dada.
   * Devuelve una cadena indicando "Hoy", "Hace 1 día" o "Hace n días".
   *
   * @param {Date} alertDate - Fecha de la alerta.
   * @return {string} - Cadena con la cantidad de días desde la alerta.
   * @memberof AlertsComponent
   */
  public getDaysAgo(alertDate: Date): string {
    const now = new Date();
    const alertDateTime = new Date(alertDate).getTime();
    const nowTime = now.getTime();

    const differenceInMilliseconds = nowTime - alertDateTime;
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    if (differenceInDays === 0) {
      return 'Hoy';
    } else if (differenceInDays === 1) {
      return 'Hace 1 día';
    } else {
      return `Hace ${differenceInDays} días`;
    }
  }

  /**
   * Marca una alerta como vista usando el servicio AlertService.
   *
   * @param {number} alertId - ID de la alerta que se va a marcar como vista.
   * @memberof AlertsComponent
   */
  public markAsViewed(alertId: number) {
    this.alertService.markAlertAsViewed(alertId).subscribe({
      next: (response) => {},
      error: (error) => {
        alert(error);
      },
    });
  }

  /**
   * Elimina una alerta mediante el servicio AlertService y actualiza la lista de alertas localmente.
   *
   * @param {number} alertId - ID de la alerta que se va a eliminar.
   * @memberof AlertsComponent
   */
  public deleteAlert(alertId: number) {
    this.alertService.deleteAlert(alertId).subscribe({
      next: (response) => {
        this.alerts.filter((a) => a.id !== response.id);
      },
      error: (error) => {
        alert(error);
      },
    });
  }
}
