import { Component, OnInit } from '@angular/core';
import { TodoComponent } from '../todo/todo.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TodoCreationModalComponent } from '../modals/todo-creation-modal/todo-creation-modal.component';
import { TodosService } from 'src/app/services/todos.service';
import { Todo } from 'src/app/models/todo.model';
import { TodoSync } from 'src/db';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, TodoComponent, CommonModule],
})
export class TodoListComponent implements OnInit{
  todos: Todo[] = [];

  constructor(public dialog: MatDialog, private todosService: TodosService){}

  ngOnInit(): void {
      this.todosService.getTodos().subscribe((response) => {
        const onlineTodos = response;


        this.todosService.getOfflineTodos().then((response) => {
          this.todos = this.combineLists(onlineTodos, response);
        })
      })
  }

  /**
   * Will take two arrays and combine them. Duplicates between the two will have the item from the first array overwritten by the second.
   * @param array1 First array to combine. This has priority and will be have duplicate items from array2 overwrite it's own content
   * @param array2 Second array to combine. Will be placed at the end of the array an overwrite duplicate items from first array
   * @returns An array of the two combined items
   */
  private combineLists(array1: Todo[], array2: Todo[]): Todo[]{
    // This maps out the first array for easier lookup
    const firstArrayMap = new Map(array1.map(item => [item.id,item]));
    for(const todo of array2){
      if(firstArrayMap.has(todo.id)){
        // This returns the object from the first array
        // Note this map still has a reference to the item from the array like this
        const existingObject = firstArrayMap.get(todo.id);
        if(existingObject){
          // Here we set the object value which means the object in the array is whats being updated
          Object.assign(existingObject, todo);
        }
      }
      else{
        // If the item isn't a duplicate it will simply be pushed to the end of the first array.
        firstArrayMap.set(todo.id, todo);
        array1.push(todo);
      }
    }
    return array1;
  }

  openTodoCreationModal(){
    let dialogRef = this.dialog.open(TodoCreationModalComponent, {
      height: '25rem',
      width: '25rem'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result){
        return;
      }

      this.todosService.postTodo(result).then((todoResponse) =>{
        this.todos.push({
          ...todoResponse,
          completed: false
        })
      });
    });
  }
}
