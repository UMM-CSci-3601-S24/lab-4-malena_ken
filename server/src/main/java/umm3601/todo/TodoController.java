package umm3601.todo;

import java.util.ArrayList;

import org.bson.UuidRepresentation;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class TodoController {
  private static final String API_TODOS = "/api/todos";
  private final JacksonMongoCollection<Todo> todoCollection;

  public TodoController(MongoDatabase db) {
    todoCollection = JacksonMongoCollection
    .builder()
    .build(
      db, "todos", Todo.class, UuidRepresentation.STANDARD
    );
  }


  public void addRoutes(Javalin server) {
    server.get(API_TODOS, this::getTodos);
  }

  public void getTodos(Context ctx) {
    int limit = 0;
    if (ctx.queryParamMap().containsKey("limit")) {
      limit = ctx.queryParamAsClass("limit", Integer.class)
        .check(it -> it >= 0, "Limit size should be non-negative")
        .get();
    }

    ArrayList<Todo> todos = todoCollection
        .find()
        .limit(limit)
        .into(new ArrayList<>());

    ctx.json(todos);
    ctx.status(HttpStatus.OK);
  }
}
