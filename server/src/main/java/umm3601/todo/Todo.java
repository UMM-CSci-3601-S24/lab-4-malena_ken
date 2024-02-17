package umm3601.todo;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Todo {
  @ObjectId @Id
@SuppressWarnings({"MemberName"})
  public String _id;
  public String owner;
  public boolean status;
  public String body;
  public String category;


}
