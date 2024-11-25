import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from "../alerts/alerts.component";


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgbToastModule, RouterModule, AlertsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public show = true;

  unreadCount: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {

  }




}
