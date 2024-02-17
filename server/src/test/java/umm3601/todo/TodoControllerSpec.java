package umm3601.todo;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;


import org.bson.Document;
//import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;


import io.javalin.http.Context;
//import umm3601.todo.TodoController;


public class TodoControllerSpec {


  private TodoController todoController;


  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;


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
      .append("owner", "Chris")
      .append("status", false)
      .append("category", "homework")
      .append("body", "Todo 0"));
      testTodos.add(
      new Document()
      .append("_id", "todo_1")
      .append("owner", "Pat")
      .append("status", true)
      .append("category", "software design")
      .append("body", "Todo 1"));
      testTodos.add(
      new Document()
      .append("_id", "todo_2")
      .append("owner", "Jake")
      .append("status", true)
      .append("category", "homework")
      .append("body", "Todo 2"));
      testTodos.add(
      new Document()
      .append("_id", "todo_3")
      .append("owner", "Blanche")
      .append("status", true)
      .append("category", "software design")
      .append("body", "Todo 3"));
      testTodos.add(
      new Document()
      .append("_id", "todo_4")
      .append("owner", "Fry")
      .append("status", false)
      .append("category", "video games")
      .append("body", "Todo 4"));


todoDocuments.insertMany(testTodos);
todoController = new TodoController(db);
  }


  @Test
  void canGetLimitedNumberOfTodos() throws IOException {
    todoController.getTodos(ctx);
  }


}

