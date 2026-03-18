import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {}
