package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.regex;
import static com.mongodb.client.model.Filters.eq;

import java.util.regex.Pattern;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

public class TodoController implements Controller {
  private static final String API_TODOS = "/api/todos";
  private static final String API_TODO_BY_ID = "/api/todos/{id}";
  private final JacksonMongoCollection<Todo> todoCollection;

  static final String OWNER_KEY = "owner";
  static final int MAX_BODY_LENGTH = 200;
  private static final String CATEGORY_REGEX = "^(software design|groceries|video games|homework)$";

  public TodoController(MongoDatabase db) {
    todoCollection = JacksonMongoCollection
        .builder()
        .build(
            db, "todos", Todo.class, UuidRepresentation.STANDARD);
  }

  /**
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if (todo == null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
      ctx.status(HttpStatus.OK);
    }
  }

  public void getTodos(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);

    ArrayList<Todo> matchingTodos = todoCollection
        .find(combinedFilter)
        .into(new ArrayList<>());

    ctx.json(matchingTodos);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  /**
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *            used to construct the filter
   * @return a Bson filter document that can be used in the `find` method
   *         to filter the database collection of todos
   */
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(OWNER_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(OWNER_KEY, pattern));
    }

    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * Add a new todo using information from the context
   * (as long as the information gives "legal" values to Todo fields)
   *
   * @param ctx a Javalin HTTP context that provides the todo info
   *            in the JSON body of the request
   */
  public void addNewTodo(Context ctx) {

    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Todo` provided in this context is
     * a "legal" todo. It checks the following things (in order):
     * - The todo has a value for the owner (`tdo.owner != null`)
     * - The todo owner is not blank (`tdo.owner.length > 0`)
     * - The provided status is strictly true or false
     * - The provided body is not blank (`tdo.body.length > 0`)
     * - The provided body is not too long (`tdo.body.length < MAX_BODY_LENGTH`)
     * - The provided category is one of "homework", "software design",
     * "video games", or "groceries"
     * If any of these checks fail, the validator will return a
     * `BadRequestResponse` with an appropriate error message.
     */
    Todo newTodo = ctx.bodyValidator(Todo.class)
        .check(tdo -> tdo.owner.length() > 0, "Todo must have a non-empty owner")
        .check(tdo -> tdo.status = true | false, "Status must be either true or false")
        .check(tdo -> tdo.body.length() > 0, "Body must not be empty")
        .check(tdo -> tdo.body.length() < MAX_BODY_LENGTH, "Body must be less than 200 characters")
        .check(tdo -> tdo.category.length() > 0, "Category cannot be empty")
        .check(tdo -> CATEGORY_REGEX.contains(tdo.category),"Must be existing category")
        .get();

    // Insert the new todo into the database
    todoCollection.insertOne(newTodo);

    // This gives the client the opportunity to know the ID of the new todo,
    // which it can use to perform further operations (e.g., display the todo).
    ctx.json(Map.of("id", newTodo._id));
    // 201 (`HttpStatus.CREATED`) is the HTTP code for when we successfully
    // create a new resource (a todo in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpStatus.CREATED);
  }

  public void addRoutes(Javalin server) {
    server.get(API_TODO_BY_ID, this::getTodo);
    server.get(API_TODOS, this::getTodos);
    server.post(API_TODOS, this::addNewTodo);
  }

}
