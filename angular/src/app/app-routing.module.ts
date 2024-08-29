import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { HelpComponent } from './components/help/help.component';

const routes: Routes = [
  {path: 'help', component: HelpComponent},
  {path: '', component: TodoListComponent},
  {path: '*', component: TodoListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
