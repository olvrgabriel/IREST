import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {}
