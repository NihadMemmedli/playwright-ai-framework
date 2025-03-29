/**
 * Test data for API and UI tests
 */

/**
 * User data for API tests
 */
export const userData = {
  newUser: {
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    address: {
      street: "123 Main St",
      suite: "Apt 4B",
      city: "Anytown",
      zipcode: "12345",
      geo: {
        lat: "40.7128",
        lng: "-74.0060",
      },
    },
    phone: "555-123-4567",
    website: "johndoe.com",
    company: {
      name: "ABC Corp",
      catchPhrase: "Making the world better",
      bs: "innovative solutions",
    },
  },

  updateUser: {
    name: "Jane Smith",
    username: "janesmith",
    email: "jane.smith@example.com",
    phone: "555-987-6543",
  },

  patchUser: {
    email: "updated.email@example.com",
    phone: "555-555-5555",
  },
};

/**
 * Todo data for UI tests
 */
export const todoData = {
  todoItems: [
    "Buy groceries",
    "Clean the house",
    "Pay bills",
    "Call mom",
    "Finish project",
  ],

  completedItems: ["Buy groceries", "Pay bills"],

  longTodoList: Array.from(
    { length: 15 },
    (_, i) => `Task ${i + 1}: ${getRandomTask()}`,
  ),
};

/**
 * Random data generators
 */
export function getRandomEmail(): string {
  const random = Math.floor(Math.random() * 10000);
  return `test.user${random}@example.com`;
}

export function getRandomUsername(): string {
  const adjectives = ["happy", "clever", "swift", "brave", "calm"];
  const nouns = ["tiger", "eagle", "dolphin", "phoenix", "wolf"];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}${noun}${number}`;
}

export function getRandomTask(): string {
  const verbs = ["Complete", "Review", "Update", "Create", "Fix"];
  const objects = [
    "presentation",
    "report",
    "email",
    "documentation",
    "code",
    "design",
  ];

  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];

  return `${verb} the ${object}`;
}

/**
 * Data-driven test matrix generators
 */
export function generateUserTestMatrix() {
  const userTypes = ["admin", "editor", "viewer"];
  const features = ["dashboard", "reports", "settings", "profile"];

  const matrix = [];

  for (const userType of userTypes) {
    for (const feature of features) {
      matrix.push({ userType, feature });
    }
  }

  return matrix;
}

export function generateTodoTestMatrix() {
  const categories = ["work", "personal", "shopping", "health"];
  const priorities = ["high", "medium", "low"];

  const matrix = [];

  for (const category of categories) {
    for (const priority of priorities) {
      matrix.push({ category, priority });
    }
  }

  return matrix;
}
