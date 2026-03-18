import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './help-chat.html',
  styleUrl: './help-chat.css',
})
export class HelpChat {}
