//import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { TodoCardComponent } from './todo-card.component';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';


@Component({
  selector: 'app-todo-profile',
  standalone: true,
  imports: [TodoCardComponent, MatCardModule, FormsModule , MatInput],
  templateUrl: './todo-profile.component.html',
  styleUrl: './todo-profile.component.scss'
})
export class TodoProfileComponent implements OnInit, OnDestroy{

  todo: Todo;
  error: { help: string, httpResponse: string, message: string }

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private todoService: TodoService) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.todoService.getTodoById(id)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: todo => this.todo = todo,
      error: _err => {
        this.error = {
          help: 'Error fetching todo',
          httpResponse: _err.message,
          message: _err.error?.title,
        };
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
