import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { db, TodoSync } from '../../db';
import { Todo } from '../models/todo.model';
import { TodoSimple } from '../models/todo-simple.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private http: HttpClient) { }

  todoLists$ = liveQuery(() => db.todoSync.toArray());
  listName = 'My new list';

  async addNewTodoSync(todoItem: TodoSimple) {
    const sw = await navigator.serviceWorker.ready;
    try {
        await db.todoSync.add(todoItem);

        // @ts-ignore
        if(sw.sync){
          // @ts-ignore
          await sw.sync.register('sync-new-todo');
        }
        else{
          if(navigator.onLine) {
            this.legacyPostTodo(todoItem);
          }
          else {
              alert("You are offline! When your internet returns, we'll finish up your request.");
          }
        }

    }
    catch(err) {
        console.log(err);
    }
  }

  // TODO Refactor this code as I'm sure its more or less a copy of the code above
  async updateTodoSync(todoItem: Todo){
    const sw = await navigator.serviceWorker.ready;
    try {
      const indexTodo = await db.todoSync.where("id").equals(todoItem.id).first();
      if(indexTodo){
        await db.todoSync.update(todoItem.id, {...todoItem});
      }
      else{
        try {
            await db.todoSync.add(todoItem);


            // @ts-ignore
            if(sw.sync){
              // @ts-ignore
              await sw.sync.register('sync-new-todo');
            }
            else{
              if(navigator.onLine) {
                this.legacyPostTodo(todoItem);
              }
              else {
                  alert("You are offline! When your internet returns, we'll finish up your request.");
              }
            }
        }
        catch(err) {
            console.log(err);
        }
      }
    }
    catch(err) {
        console.log(err);
    }
  }

  identifyList(index: number, list: TodoSync) {
    return `${list.id}${list.description}`;
  }

  async getOfflineTodos(): Promise<Todo[]>{
    const sw = await navigator.serviceWorker.ready;
    try {
      return (await db.todoSync.toArray()).map((item: TodoSync) => {return {description: item.description, completed: item.completed ? item.completed : false, id: item.id}});
    }
    catch(err) {
      console.log(err);
      return []
    }
  }






  private legacyPostTodo(todo: TodoSimple){
    // TODO I think we need some some try catch to make sure it gets deleted if it fails as this would be an error from the endpoint
    this.http.post<any>('api/todos', todo).subscribe(() => {
      db.todoSync.delete(todo.id);
    });
  }


}
