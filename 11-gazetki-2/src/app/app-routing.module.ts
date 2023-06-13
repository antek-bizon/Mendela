import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { InputEarningComponent } from './input-earning/input-earning.component'
import { MagazineComponent } from './magazine/magazine.component'

const routes: Routes = [
  { path: ':name/:year', component: MagazineComponent },
  { path: ':name', component: MagazineComponent },
  { path: '', component: InputEarningComponent },
  { path: '**', redirectTo: '/' }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
