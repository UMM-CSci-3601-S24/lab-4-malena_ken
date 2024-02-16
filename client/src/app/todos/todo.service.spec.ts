import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: 'blanche_id',
      owner: 'Blanche',
      status: true,
      body: 'buy frozen pizzas',
      category: 'groceries',
    },
    {
      _id: 'fry_id',
      owner: 'Fry',
      status: false,
      body: 'build a new sims game',
      category: 'video games',
    },
    {
      _id: 'Dawn_id',
      owner: 'Dawn',
      status: true,
      body: 'Write a blog post about JavaScript',
      category: 'software design',
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
    /* We really don't care what `getTodos()` returns. Since all the
     * filtering (when there is any) is happening on the server,
     * `getTodos()` is really just a "pass through" that returns whatever it receives,
     * without any "post processing" or manipulation. The test in this
     * `describe` confirms that the HTTP request is properly formed
     * and sent out in the world, but we don't _really_ care about
     * what `getTodos()` returns as long as it's what the HTTP
     * request returns.
     *
     * So in this test, we'll keep it simple and have
     * the (mocked) HTTP request return the entire list `testTodos`
     * even though in "real life" we would expect the server to
     * return return a filtered subset of the todos. Furthermore, we
     * won't actually check what got returned (there won't be an `expect`
     * about the returned value). Since we don't use the returned value in this test,
     * It might also be fine to not bother making the mock return it.
     */
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      // Call `todoService.getTodos()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodos()`.
      // The `todos` argument in the function is the array of Todos returned by
      // the call to `getTodos()`.
      todoService.getTodos().subscribe((todos) => {
        expect(todos)
          .withContext('returns the test todos')
          .toBe(testTodos);
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getTodos()` that takes in no filters in the params,
    * we really don't care what `getTodos()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getTodos()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    it('correctly calls api/todos with filter parameter \'owner\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ owner: 'Blanche' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('owner', 'Blanche') });
      });
    });
  });


  describe('When getTodoById() is given an ID', () => {
    /* We really don't care what `getTodoById()` returns. Since all the
     * interesting work is happening on the server, `getTodoById()`
     * is really just a "pass through" that returns whatever it receives,
     * without any "post processing" or manipulation. The test in this
     * `describe` confirms that the HTTP request is properly formed
     * and sent out in the world, but we don't _really_ care about
     * what `getTodoById()` returns as long as it's what the HTTP
     * request returns.
     *
     * So in this test, we'll keep it simple and have
     * the (mocked) HTTP request return the `targetTodo`
     * Furthermore, we won't actually check what got returned (there won't be an `expect`
     * about the returned value). Since we don't use the returned value in this test,
     * It might also be fine to not bother making the mock return it.
     */
    it('calls api/todos/id with the correct ID', waitForAsync(() => {
      // We're just picking a Todo "at random" from our little
      // set of Todos up at the top.
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one todo from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      // Call `todoService.getTodo()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodoById()`.
      // The `todo` argument in the function below is the thing of type Todo returned by
      // the call to `getTodoById()`.
      todoService.getTodoById(targetId).subscribe((todo) => {
        expect(todo).withContext('returns the target todo').toBe(targetTodo);
        // The `Todo` returned by `getTodoById()` should be targetTodo, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
      });
    }));

  });

  describe('filterTodos()', () => {

    it('filters by owner', () => {
      const todoOwner = 'Blanche';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.owner).toBe(todoOwner);
      });
    });

    it('filters by body', () => {
      const todoBody = 'pizzas';
      const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by status', () => {
      const todoStatus = true;
      const filteredTodos = todoService.filterTodos(testTodos, { status: todoStatus });
      expect(filteredTodos.length).toBe(2);
      filteredTodos.forEach(todo => {
        expect(todo.status).toBe(todoStatus);
      });
    });

    it('filters by category', () => {
      const todoCategory = 'software design';
      const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.category).toBe(todoCategory);
      });
    });

    it('combination of filters status, body, and owner', () => {
      const todoStatus = false;
      const todoBody = 'sims';
      const todoOwner = 'Fry';
      const filteredTodos = todoService.filterTodos(testTodos, { status: todoStatus, body: todoBody, owner: todoOwner });
      expect(filteredTodos.length).toBe(1);
      filteredTodos.forEach(todo => {
        expect(todo.status).toBe(todoStatus);
        expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
        expect(todo.body == 'buy frozen pizzas');
        expect(todo.owner).toBe(todoOwner);
      });
    });

  });



});

