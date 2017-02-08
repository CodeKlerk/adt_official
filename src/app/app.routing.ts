/**
 * Created by griga on 7/11/16.
 */


import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from "./shared/layout/app-layouts/main-layout.component";
import { AuthLayoutComponent } from "./shared/layout/app-layouts/auth-layout.component";
import { FaqComponent } from "./faq/faq.component";

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '', redirectTo: 'home', pathMatch: 'full'
      },
      { path: 'home', loadChildren: 'app/+home/home.module#HomeModule', data: { pageTitle: 'Dashboard' } },
      { path: 'patients', loadChildren: 'app/patients/patients.module#PatientsModule', data: { pageTitle: 'Patients' } },
      { path: 'inventory', loadChildren: 'app/inventory/inventory.module#InventoryModule', data: { pageTitle: 'Inventory' } },
      { path: 'profile', loadChildren: 'app/profile/profile.module#ProfileModule', data: { pageTitle: 'Profile' } },
      { path: 'settings', loadChildren: 'app/settings/settings.module#SettingsModule', data: { pageTitle: 'Settings' } },
      { path: 'orders', loadChildren: 'app/orders/orders.module#OrdersModule', data: { pageTitle: 'Orders' } },
      { path: 'faq', component: FaqComponent, data: { pageTitle: 'Frequently Asked Questions' } }
    ]
  },

  { path: 'auth', component: AuthLayoutComponent, loadChildren: 'app/+auth/auth.module#AuthModule' },

  { path: '**', redirectTo: 'home' }
  //
];

export const routing = RouterModule.forRoot(routes);
