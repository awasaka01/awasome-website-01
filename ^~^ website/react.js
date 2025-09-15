import React from "react";
function MyButton({ title }) {
  return /* @__PURE__ */ React.createElement("button", null, title);
}
export default function MyApp() {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Welcome to my app"), /* @__PURE__ */ React.createElement(MyButton, { title: "I'm a button" }));
}
