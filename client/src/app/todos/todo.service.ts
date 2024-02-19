import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { SortBy, Todo } from './todo';

/**
 * Service that provides the interface for getting information
 * about `Todos` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // The URL for the todos part of the server API.
  readonly todoUrl: string = `${environment.apiUrl}todos`;

  private readonly ownerKey = 'owner';

  constructor(private httpClient: HttpClient) {
  }

  getTodos(filters?: { owner?: string }): Observable<Todo[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner)
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<Todo[]>`
    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `Todo` with the specified ID.
   *
   * @param id the ID of the desired todo
   * @returns an `Observable` containing the resulting todo.
   */
  getTodoById(id: string): Observable<Todo> {
    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }
  /**
* A service method that filters an array of `Todo` using
* the specified filters.
*
* Note that the filters here support partial matches. Since the
* matching is done locally we can afford to repeatedly look for
* partial matches instead of waiting until we have a full string
* to match against.
*
* @param todos the array of `Todos` that we're filtering
* @param filters the map of key-value pairs used for the filtering
* @returns an array of `Todos` matching the given filters
*/

  filterTodos(todos: Todo[], filters: { owner?: string, body?: string, status?: boolean, category?: string, limit?: number}): Todo[] {
    let filteredTodos = todos;

    // Filter by owner
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }

        // Filters by status
        if (filters.status !== undefined) {
          filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
        }


    // Filters by body
    if (filters.body) {
      filters.body = filters.body.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
    }

    // Filter by category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.category.toLowerCase().indexOf(filters.category) !== -1);
    }
    // Filter by limit
    if (filters.limit) {
      filteredTodos = filteredTodos.slice(0, filters.limit);
    }

    return filteredTodos;
  }

  sortTodos(todos: Todo[], sortBy?: SortBy): Todo[] {
    const sortedTodos = todos;
    if(sortBy === 'owner'){
      sortedTodos.sort((todo1,todo2) => todo1.owner.localeCompare(todo2.owner))
    }
    else if(sortBy === 'category'){
      sortedTodos.sort((todo1,todo2) => todo1.category.localeCompare(todo2.category))
    }
    else if(sortBy === 'status'){
      sortedTodos.sort((todo1,todo2) => todo1.status.toString().localeCompare(todo2.status.toString()))
    }
    else if(sortBy === '_id'){
      sortedTodos.sort((todo1,todo2) => todo1._id.localeCompare(todo2._id))
    }
    else if(sortBy === 'body'){
      sortedTodos.sort((todo1,todo2) => todo1.body.localeCompare(todo2.body))
    }
    return sortedTodos;
  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(res => res.id));
  }
}
