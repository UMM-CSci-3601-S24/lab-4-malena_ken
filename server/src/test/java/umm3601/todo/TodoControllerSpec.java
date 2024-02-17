package umm3601.todo;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.bson.Document;
import org.bson.types.ObjectId;
//import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;


import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.Context;
//import umm3601.todo.TodoController;
//import io.javalin.http.HttpStatus;
//import io.javalin.json.JavalinJackson;
import io.javalin.http.HttpStatus;
//import umm3601.user.UserController;


public class TodoControllerSpec {

  @SuppressWarnings({ "MagicNumber" })
  private TodoController todoController;
  private ObjectId frysId;
  private ObjectId chrisId;
  private ObjectId patId;
  private ObjectId jakeId;
  private ObjectId blancheId;


  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;
  //private static JavalinJackson javalinJackson = new JavalinJackson();


  @Mock
  private Context ctx;


  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;


  @Captor
  private ArgumentCaptor<Todo> todoCaptor;


  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;


  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");


    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }


  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }


  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);


    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
      new Document()
      .append("_id", "todo_0")
      .append("owner", chrisId)
      .append("status", false)
      .append("category", "homework")
      .append("body", "Todo 0"));
      testTodos.add(
      new Document()
      .append("_id", patId)
      .append("owner", "Pat")
      .append("status", true)
      .append("category", "software design")
      .append("body", "Todo 1"));
      testTodos.add(
      new Document()
      .append("_id", jakeId)
      .append("owner", "Jake")
      .append("status", true)
      .append("category", "homework")
      .append("body", "Todo 2"));
      testTodos.add(
      new Document()
      .append("_id", blancheId)
      .append("owner", "Blanche")
      .append("status", true)
      .append("category", "software design")
      .append("body", "Todo 3"));

      frysId = new ObjectId();
      Document fry = new Document()
      .append("_id", frysId)
      .append("owner", "Fry")
      .append("status", true)
      .append("category", "groceries")
      .append("body", "Todo 5");


//todoDocuments.insertMany(testTodos);
todoDocuments.insertOne(fry);

todoController = new TodoController(db);
  }


  @Test
  public void canBuildController() throws IOException {
    Javalin mockServer = Mockito.mock(Javalin.class);
    todoController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(0)).get(any(), any());
  }



  @Test
  void canGetAllTodos() throws IOException {

    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }

  @Test
  void canGetTodosWithOwner() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.OWNER_KEY, Arrays.asList(new String[] {"Fry"}));
    queryParams.put(TodoController.SORT_ORDER_KEY, Arrays.asList(new String[] {"desc"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(TodoController.OWNER_KEY)).thenReturn("Fry");
    when(ctx.queryParam(TodoController.SORT_ORDER_KEY)).thenReturn("desc");

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    for (Todo todo : todoArrayListCaptor.getValue()) {
      assertEquals("Fry", todo.owner);
    }
  }



}

