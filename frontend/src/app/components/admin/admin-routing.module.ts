import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { PromotionComponent } from './promotion/promotion.component';
import { ReportComponent } from './report/report.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { ProductCreateComponent } from '../../features/product-create/product-create.component';
import { ProductImageUploadComponent } from '../../features/product-image-upload/product-image-upload.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'product',
        component: ProductComponent,
        children: [
          { path: 'create', component: ProductCreateComponent },
          { path: 'image-upload/:id', component: ProductImageUploadComponent }, // ✅ ADD AQUI
          { path: '', redirectTo: 'create', pathMatch: 'full' },
        ],
      },

      {
        path: 'promotion',
        children: [
          { path: '', component: PromotionComponent },
          { path: 'create', component: PromotionComponent },
        ],
      },

      { path: 'report', component: ReportComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
