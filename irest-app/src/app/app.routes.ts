import { Routes } from '@angular/router';
import { authGuard, adminGuard, funerariaGuard, usuarioGuard } from './core/guards/auth.guard';

import { HomeComponent } from './features/home/home';
import { SearchResults } from './features/search-results/search-results';
import { HowItWorks } from './features/how-it-works/how-it-works';
import { Help } from './features/help/help';
import { FuneralHomeDetails } from './features/funeral-home-details/funeral-home-details';
import { ReviewForm } from './features/review-form/review-form';
import { HelpChat } from './features/help-chat/help-chat';
import { DashboardProvider } from './features/dashboard-provider/dashboard-provider';
import { DashboardAdmin } from './features/dashboard-admin/dashboard-admin';
import { DashboardUser } from './features/dashboard-user/dashboard-user';
import { AdminCrudComponent } from './features/admin-crud/admin-crud.component';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { RegisterFunerariaComponent } from './features/register-funeraria/register-funeraria';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'busca', component: SearchResults },
  { path: 'como-funciona', component: HowItWorks },
  { path: 'ajuda', component: Help },
  { path: 'detalhes/:id', component: FuneralHomeDetails },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: RegisterComponent },
  { path: 'cadastro-funeraria', component: RegisterFunerariaComponent },

  // Protected routes (logged in)
  { path: 'avaliar/:id', component: ReviewForm, canActivate: [usuarioGuard] },
  { path: 'chat', component: HelpChat, canActivate: [authGuard] },

  // Role-specific routes
  { path: 'meu-painel', component: DashboardUser, canActivate: [usuarioGuard] },
  { path: 'painel-funeraria', component: DashboardProvider, canActivate: [funerariaGuard] },
  { path: 'painel-admin', component: DashboardAdmin, canActivate: [adminGuard] },
  { path: 'admin/crud', component: AdminCrudComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];
