import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin {}
