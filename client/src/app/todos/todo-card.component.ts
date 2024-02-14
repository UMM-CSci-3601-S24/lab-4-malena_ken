import { Component } from '@angular/core';
import { Todo } from './todo';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { TodoService } from './todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatLabel, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss'],
  providers: [],
  standalone: true,
  imports: [MatFormField, MatOption, MatHint, MatLabel, FormsModule, MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatButton, RouterLink, MatInput]
})
export class TodoCardComponent {
  public serverFilteredTodos: Todo[];
  public todos: Todo[];

  public todoOwner: string;
  public todoStatus: boolean;
  public todoCategory: string;
  public todoBody: string;
  //public viewType: 'list' | 'card' = 'list';
 // public todoSortBy: SortBy;
  public limit: number;

  errMsg = '';
  private ngUnsubscribe = new Subject<void>();


  /**
   * This constructor injects both an instance of `TodoService`
   * and an instance of `MatSnackBar` into this component.
   *
   * @param todoService the `TodoService` used to get todos from the server
   * @param snackBar the `MatSnackBar` used to display feedback
   */
  constructor(private todoService: TodoService, private snackBar: MatSnackBar) {
    // Nothing here – everything is in the injection parameters.
  }

  /**
   * Get the todos from the server, filtered by the role and age specified
   * in the GUI.
   */
  getTodosFromServer() {
    this.todoService.getTodos({
      // Filter the users by category
      category: this.todoCategory
    }).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (returnedTodos) => {
        this.serverFilteredTodos = returnedTodos;
        this.updateFilter();
        this.serverFilteredTodos = this.todos;
        //this.updateSorting();
      },
      error: (err) => {
        if (err.error instanceof ErrorEvent) {
          this.errMsg = `Problem in the client – Error: ${err.error.message}`;
        } else {
          this.errMsg = `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`;
        }
      },
    })
  }
  public updateFilter() {
    this.todos = this.todoService.filterTodos(
      this.serverFilteredTodos, { body: this.todoBody, owner: this.todoOwner, status: this.todoStatus, limit: this.limit }
    )
  }

/*   public updateSorting() {
    this.todos = this.todoService.sortTodos(this.serverFilteredTodos, this.todoSortBy)
  } */

  /**
 * Starts an asynchronous operation to update the users list
 */
  ngOnInit(): void {
    this.getTodosFromServer();
  }

  /**
* When this component is destroyed, we should unsubscribe to any
* outstanding requests.
*/
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
