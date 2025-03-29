import { StringHelper } from "../helpers/StringHelper";
import { DateHelper } from "../helpers/DateHelper";

/**
 * Builder class for creating test data with fluent API
 */
export class TestDataBuilder {
  private data: Record<string, any> = {};

  /**
   * Create a new instance
   */
  static create(): TestDataBuilder {
    return new TestDataBuilder();
  }

  /**
   * Set a user with default values
   */
  withDefaultUser(): TestDataBuilder {
    this.data.user = {
      id: Math.floor(Math.random() * 1000),
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
    };
    return this;
  }

  /**
   * Set a random user
   */
  withRandomUser(): TestDataBuilder {
    const userId = Math.floor(Math.random() * 1000);
    const username = StringHelper.generateRandomString(8).toLowerCase();

    this.data.user = {
      id: userId,
      name: `User ${userId}`,
      username: username,
      email: `${username}@example.com`,
    };
    return this;
  }

  /**
   * Set specific user properties
   * @param userProps - User properties to set
   */
  withUser(userProps: Record<string, any>): TestDataBuilder {
    this.data.user = {
      ...this.data.user,
      ...userProps,
    };
    return this;
  }

  /**
   * Set default todo items
   */
  withDefaultTodos(): TestDataBuilder {
    this.data.todos = [
      { id: 1, title: "Complete task 1", completed: false },
      { id: 2, title: "Complete task 2", completed: true },
      { id: 3, title: "Complete task 3", completed: false },
    ];
    return this;
  }

  /**
   * Set specific number of random todos
   * @param count - Number of todos to generate
   */
  withRandomTodos(count: number): TestDataBuilder {
    const todos = [];
    for (let i = 0; i < count; i++) {
      todos.push({
        id: i + 1,
        title: `Todo ${i + 1}: ${StringHelper.generateRandomString(10)}`,
        completed: Math.random() > 0.5,
      });
    }
    this.data.todos = todos;
    return this;
  }

  /**
   * Add a new todo item
   * @param todoProps - Todo properties
   */
  withTodo(todoProps: Record<string, any>): TestDataBuilder {
    if (!this.data.todos) {
      this.data.todos = [];
    }
    this.data.todos.push({
      id: this.data.todos.length + 1,
      completed: false,
      ...todoProps,
    });
    return this;
  }

  /**
   * Set a post with default values
   */
  withDefaultPost(): TestDataBuilder {
    this.data.post = {
      id: Math.floor(Math.random() * 1000),
      title: "Test Post Title",
      body: "This is the body of the test post with some content.",
      userId: this.data.user?.id || 1,
    };
    return this;
  }

  /**
   * Set a random post
   */
  withRandomPost(): TestDataBuilder {
    const postId = Math.floor(Math.random() * 1000);

    this.data.post = {
      id: postId,
      title: `Post ${postId}: ${StringHelper.generateRandomString(15)}`,
      body: StringHelper.generateRandomString(100),
      userId: this.data.user?.id || Math.floor(Math.random() * 10) + 1,
    };
    return this;
  }

  /**
   * Set specific post properties
   * @param postProps - Post properties to set
   */
  withPost(postProps: Record<string, any>): TestDataBuilder {
    this.data.post = {
      ...this.data.post,
      ...postProps,
    };
    return this;
  }

  /**
   * Set a comment with default values
   */
  withDefaultComment(): TestDataBuilder {
    this.data.comment = {
      id: Math.floor(Math.random() * 1000),
      name: "Test Comment",
      email: "commenter@example.com",
      body: "This is a test comment.",
      postId: this.data.post?.id || 1,
    };
    return this;
  }

  /**
   * Set specific comment properties
   * @param commentProps - Comment properties to set
   */
  withComment(commentProps: Record<string, any>): TestDataBuilder {
    this.data.comment = {
      ...this.data.comment,
      ...commentProps,
    };
    return this;
  }

  /**
   * Set API request data
   * @param requestData - The request data
   */
  withRequestData(requestData: Record<string, any>): TestDataBuilder {
    this.data.request = requestData;
    return this;
  }

  /**
   * Set API response data
   * @param responseData - The response data
   */
  withResponseData(responseData: Record<string, any>): TestDataBuilder {
    this.data.response = responseData;
    return this;
  }

  /**
   * Set a timestamp property
   * @param key - The key to use
   */
  withTimestamp(key: string = "timestamp"): TestDataBuilder {
    this.data[key] = DateHelper.getCurrentDateTimeISO();
    return this;
  }

  /**
   * Add a custom property
   * @param key - The property key
   * @param value - The property value
   */
  withProperty(key: string, value: any): TestDataBuilder {
    this.data[key] = value;
    return this;
  }

  /**
   * Build and return the test data
   */
  build(): Record<string, any> {
    return { ...this.data };
  }
}
