// Modern im

// Modern TS/JS features
const button = document.querySelector<HTMLButtonElement>("#btn")!;
const message = document.querySelector<HTMLParagraphElement>("#message")!;

button.addEventListener("click", () => {
  const now = new Date();
  message.textContent = `Clicked at ${now.toLocaleTimeString()}`;
});

// Async function with optional chaining and nullish coalescing
async function fetchData (url ?: string) {
  const res = await fetch(url ?? "/data.json");
  const data = await res.json();
  console.log(data?.results?.[0] ?? "No results");
}
fetchData();
console.log("object");


// Classes, inheritance, private fields
class Shape {
  #name : string;
  constructor (name : string) { this.#name = name; }
  info () { console.log(`Shape: ${this.#name}`); }
}
class Circle extends Shape {
  constructor () { super("Circle"); }
}
new Circle().info();

// Optional chaining, template literals, arrow functions
const obj : any = { a: { b: 42 } };
console.log(`Value is: ${obj.a?.b ?? "missing"}`);

// Big array manipulation, spread, map, reduce
const numbers = [1, 2, 3, 4, 5, 6];
const doubled = numbers.map((n) => n * 2).filter((n) => n > 5);
const sum = doubled.reduce((acc, val) => acc + val, 0);
console.log("Sum:", sum);

// Promise.all example
Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(([a, b]) => console.log(a + b));
