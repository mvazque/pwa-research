import { Component, Input } from '@angular/core';
import { TodosService } from 'src/app/services/todos.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  standalone: true
})
export class TodoComponent {
  @Input({ required: true }) todo!: {
    description: string,
    id: string,
    completed: boolean
  }

  constructor(private todoService: TodosService){}

  toggleCompletionStatus(){
    this.todo.completed = !this.todo.completed;
    this.todoService.updateTodo(this.todo).then();
  }
}
