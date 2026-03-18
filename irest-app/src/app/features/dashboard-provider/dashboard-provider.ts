import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';

@Component({
  selector: 'app-dashboard-provider',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './dashboard-provider.html',
  styleUrl: './dashboard-provider.css',
})
export class DashboardProvider {}
