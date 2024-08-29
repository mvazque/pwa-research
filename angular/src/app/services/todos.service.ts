import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../models/todo.model';
import { Observable, of } from 'rxjs';
import { DatabaseService } from './database.service';
import * as uuid from 'uuid';
import { TodoSimple } from '../models/todo-simple.model';

@Injectable({
  providedIn: 'root'
})
export class TodosService {

  constructor(private http: HttpClient, private dbService: DatabaseService) { }

  getTodos(): Observable<Todo[]>{
    return this.http.get<any>('api/getTodos');
  }

  getOfflineTodos(): Promise<Todo[]> {
    return this.dbService.getOfflineTodos();
  }

  async postTodo(todoDescription: string): Promise<TodoSimple>{
    const todo = {
      description: todoDescription,
      id: uuid.v4()
    }
    await this.dbService.addNewTodoSync(todo);
    return todo;
  }

  async updateTodo(todo: Todo): Promise<any>{
    await this.dbService.updateTodoSync(todo);
    return
    // return this.http.post<any>('api/updateTodoCompleted', todo);
  }
}
