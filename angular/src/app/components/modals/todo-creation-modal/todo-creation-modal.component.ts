import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-creation-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './todo-creation-modal.component.html',
  styleUrls: ['./todo-creation-modal.component.scss']
})
export class TodoCreationModalComponent {
  todoDescription = '';

  constructor(public dialogRef: MatDialogRef<TodoCreationModalComponent>) { }
  submitForm(){
    if(this.todoDescription.trim() === ''){
      alert('Input should not be empty');
      return
    }
    this.dialogRef.close(this.todoDescription);
  }
}
