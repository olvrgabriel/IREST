import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home';
import { SearchResults } from './features/search-results/search-results';
import { HowItWorks } from './features/how-it-works/how-it-works';
import { Help } from './features/help/help';
import { FuneralHomeDetails } from './features/funeral-home-details/funeral-home-details';
import { ReviewForm } from './features/review-form/review-form';
import { HelpChat } from './features/help-chat/help-chat';
import { DashboardProvider } from './features/dashboard-provider/dashboard-provider';
import { DashboardAdmin } from './features/dashboard-admin/dashboard-admin';
import { AdminCrudComponent } from './features/admin-crud/admin-crud.component';

// API Integration Example Components
import { FunerariaListComponent } from './components/funeraria-list/funeraria-list.component';
import { ReviewCreateComponent } from './components/review-create/review-create.component';
import { ChatSessionComponent } from './components/chat-session/chat-session.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'busca', component: SearchResults },
  { path: 'como-funciona', component: HowItWorks },
  { path: 'ajuda', component: Help },
  { path: 'detalhes/:id', component: FuneralHomeDetails },
  { path: 'avaliar/:id', component: ReviewForm },
  { path: 'chat', component: HelpChat },
  { path: 'painel-funeraria', component: DashboardProvider },
  { path: 'painel-admin', component: DashboardAdmin },
  
  // API Integration Example Routes
  { path: 'funerarias-api', component: FunerariaListComponent },
  { path: 'avaliar-api/:id', component: ReviewCreateComponent },
  { path: 'chat-api/:sessionId', component: ChatSessionComponent },
  { path: 'chat-api', component: ChatSessionComponent },
  
  // Admin CRUD
  { path: 'admin/crud', component: AdminCrudComponent },
  
  { path: '**', redirectTo: '' } 
];