import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCreationModalComponent } from './todo-creation-modal.component';

describe('TodoCreationModalComponent', () => {
  let component: TodoCreationModalComponent;
  let fixture: ComponentFixture<TodoCreationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoCreationModalComponent]
    });
    fixture = TestBed.createComponent(TodoCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
