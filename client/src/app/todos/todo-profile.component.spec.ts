import { Location } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockTodoService } from '../../testing/todo.service.mock';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoProfileComponent } from './todo-profile.component';
import { TodoService } from './todo.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';





describe('TodoProfileComponent', () => {
  let component: TodoProfileComponent;
  let fixture: ComponentFixture<TodoProfileComponent>;
  const mockTodoService = new MockTodoService();
  const fryId = 'fry_id';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id : fryId
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        MatCardModule,
        TodoProfileComponent, TodoCardComponent
    ],
    providers: [
        { provide: TodoService, useValue: mockTodoService },
        { provide: ActivatedRoute, useValue: activatedRoute }
    ]
})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific todo profile', () => {
    const expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);
  });

  it('should navigate to correct todo when the id parameter changes', () => {
    let expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);

    // Changing the paramMap should update the displayed todo profile.
    expectedTodo = MockTodoService.testTodos[1];
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);
  });

  it('should have `null` for the todo for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a todo, we expect the service
    // to return `null`, so we would expect the component's todo
    // to also be `null`.
    expect(component.todo).toBeNull();
  });

  it('should set error data on observable error', () => {
    activatedRoute.setParamMap({ id: fryId });

    const mockError = { message: 'Test Error', error: { title: 'Error Title' } };

    // const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const getTodoSpy = spyOn(mockTodoService, 'getTodoById')
      .and
      .returnValue(throwError(() => mockError));

    // component.todo = throwError(() => mockError) as Observable<Todo>;

    component.ngOnInit();

    expect(component.error).toEqual({
      help: 'There was a problem loading the todo – try again.',
      httpResponse: mockError.message,
      message: mockError.error.title,
    });
    expect(getTodoSpy).toHaveBeenCalledWith(fryId);
  });

});


describe('DeleteTodo()', () => {
  let component: TodoProfileComponent;
  let fixture: ComponentFixture<TodoProfileComponent>;
  let todoService: TodoService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let location: Location;
  let router: Router;
  const fryId = 'fry_id';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    id : fryId
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([
          { path: 'todos/1', component: TodoProfileComponent }
        ]),
        HttpClientTestingModule
      ],
      providers: [TodoService]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoProfileComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
  });

  it('should call deleteTodo on TodoService when deleteTodo is called in TodoProfileComponent', () => {
    const deleteTodoSpy = spyOn(todoService, 'deleteTodo').and.callThrough();
    component.deleteTodo(fryId);
    expect(deleteTodoSpy).toHaveBeenCalledWith(fryId);
  });

  it('should delete a todo and navigate to /todos', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const deleteTodoSpy = spyOn(todoService, 'deleteTodo').and.returnValue(of(null));

    component.deleteTodo('testId');

    expect(deleteTodoSpy).toHaveBeenCalledWith('testId');
    expect(navigateSpy).toHaveBeenCalledWith(['/todos']);
  });
});


