// Define an interface for a Person object
interface Person {
  name: string;
  age: number;
  isStudent?: boolean; // Optional property
}

// Function that takes a Person object as an argument and returns a string
function greetPerson(person: Person): string {
  if (person.isStudent) {
    return `Hello, ${person.name}! You are a ${person.age}-year-old student.`;
  } else {
    return `Hello, ${person.name}! You are ${person.age} years old.`;
  }
}

// Create instances of the Person interface
const john: Person = {
  name: "John Doe",
  age: 30,
};

const jane: Person = {
  name: "Jane Smith",
  age: 22,
  isStudent: true,
};

// Call the function with the Person objects
console.log(greetPerson(john));
console.log(greetPerson(jane));

// Example of type inference
let message = "This is a string"; // TypeScript infers 'message' as type 'string'
// message = 123; // This would cause a TypeScript error because 'message' is inferred as a string

document.body.onload = () => {
	console.log("Loaded");
//   document.body.style.color = "darkslateblue";
};