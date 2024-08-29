// db.ts
import Dexie, { Table } from 'dexie';

export interface TodoSync {
  id: string;
  completed?: boolean;
  description: string;
}
// export interface TodoItem {
//   id?: number;
//   todoListId: number;
//   title: string;
//   done?: boolean;
// }

export class AppDB extends Dexie {
  todoSync!: Table<TodoSync, string>;
  // todoLists!: Table<TodoList, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      todoSync: '++id',
      // todoItems: '++id, todoListId',
    });
  }
}

export const db = new AppDB();
