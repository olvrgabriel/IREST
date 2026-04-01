import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

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
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'busca', component: SearchResults },
  { path: 'como-funciona', component: HowItWorks },
  { path: 'ajuda', component: Help },
  { path: 'detalhes/:id', component: FuneralHomeDetails },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: RegisterComponent },

  // Protected routes (logged in)
  { path: 'avaliar/:id', component: ReviewForm, canActivate: [authGuard] },
  { path: 'chat', component: HelpChat, canActivate: [authGuard] },
  { path: 'painel-funeraria', component: DashboardProvider, canActivate: [authGuard] },

  // Admin routes
  { path: 'painel-admin', component: DashboardAdmin, canActivate: [adminGuard] },
  { path: 'admin/crud', component: AdminCrudComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];
