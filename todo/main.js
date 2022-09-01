// var allTodos = [
//   {
//     id: 0,
//     text: "Todo number 1.",
//     priority: "urgent",
//     date: "2022-4-10",
//     isCompleted: true,
//   },
//   {
//     id: 1,
//     text: "Todo number 2.",
//     priority: "regular",
//     date: "2022-8-28",
//     isCompleted: false,
//   },
//   {
//     id: 2,
//     text: "Todo number 3.",
//     priority: "low",
//     date: "2022-8-28",
//     isCompleted: false,
//   },
//   {
//     id: 3,
//     text: "Todo number 4.",
//     priority: "urgent",
//     date: "2022-7-1",
//     isCompleted: true,
//   },
// ];

const signOutButton = document.querySelector(".sign-out");

const nav = document.querySelector("nav");
const todayTodoNav = nav.querySelector(".today");
const completedTodoNav = nav.querySelector(".completed");
const allTodoNav = nav.querySelector(".all");

const allTasksSec = document.querySelector(".all-tasks");
const todayTasksSec = document.querySelector(".today-tasks");
const completedTasksSec = document.querySelector(".completed-tasks");

// MODAL
const modalContainer = document.querySelector(".modal-container");

const modalInputText = modalContainer.querySelector('input[type="text"]');
const modalInputDate = modalContainer.querySelector('input[type="date"]');
const modalInputPriority = modalContainer.querySelector("select");

const btnAddTodo = document.querySelectorAll(".add-todo-btn");
const btnModalCancel = document.querySelector(".modal-close");
const btnModalSubmit = document.querySelector(".modal-success");

fetch("/getdetails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    token: localStorage.getItem("livelabtoken"),
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    setData(data.userDetails.todos, data.userDetails);
    setHTML();
  });

var allTodos, todayTodos, completedTodos, currUserName, currDate, ppNumber;

function todayDate() {
  const date = new Date();
  currDate =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0");
  return currDate;
}

document.querySelectorAll(".curr-date").forEach((d) => {
  d.innerHTML = todayDate();
});

function setData(data, { name, avtaar }) {
  if (name) {
    currUserName = name;
  }
  ppNumber = avtaar;
  allTodos = data;
  todayTodos = [];
  data.forEach((todo) => {
    if (todo.date === todayDate()) todayTodos.push(todo);
  });

  completedTodos = [];
  data.forEach((todo) => {
    if (todo.isCompleted) completedTodos.push(todo);
  });
}

function setHTML() {
  console.log(ppNumber);
  document
    .querySelector(".pp")
    .setAttribute("src", `./images/pp-${ppNumber}.png`);

  document.querySelectorAll(".curr-user-name").forEach((u) => {
    u.innerHTML = currUserName;
  });

  document.querySelectorAll(".curr-date").forEach((d) => {
    d.innerHTML = currDate;
  });

  allTasksSec.querySelector(".todos").innerHTML = "";
  allTodos.forEach((todo) => {
    allTasksSec
      .querySelector(".todos")
      .insertAdjacentHTML("beforeend", todoHTML(todo));
  });
  todayTasksSec.querySelector(".todos").innerHTML = "";
  todayTodos.forEach((todo) => {
    todayTasksSec
      .querySelector(".todos")
      .insertAdjacentHTML("beforeend", todoHTML(todo));
  });

  completedTasksSec.querySelector(".todos").innerHTML = "";
  completedTodos.forEach((todo) => {
    completedTasksSec
      .querySelector(".todos")
      .insertAdjacentHTML("beforeend", todoHTML(todo));
  });

  document.querySelectorAll(".todo").forEach((todo) => {
    todo.addEventListener("click", function (e) {
      const target = e.target;
      console.log(target);
      if (target.tagName === "INPUT") {
        // CHECK FUNCTIONALITY

        console.log(target.checked);
        fetch("/completedtodo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("livelabtoken"),
            id: todo.getAttribute("data-id"),
            isCompleted: target.checked,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setData(data.userDetails.todos);
            setHTML();
          });
      }

      if (target.className === "edit-btn") {
        // EDIT
        const todoID = todo.getAttribute("data-id");
        var modalContainer = document.querySelector(".modal-container");
        modalContainer.setAttribute("data-scope", todoID);
        var selectedTodo = allTodos.filter((ele) => ele._id == todoID);
        console.log(selectedTodo[0].text);
        modalInputText.value = selectedTodo[0].text;
        modalInputDate.value = selectedTodo[0].date;
        modalInputPriority.value = selectedTodo[0].priority;
        modalContainer.classList.add("show");
      }

      if (target.className === "delete-btn") {
        // DELETE
        console.log(todo.getAttribute("data-id"));
        fetch("/deletetodo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("livelabtoken"),
            id: todo.getAttribute("data-id"),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setData(data.userDetails.todos);
            setHTML();
          });
      }
    });
  });
}

// Generate--UI
function todoHTML(todo) {
  return `
  <div class="todo" data-id="${todo._id}" >
    <input type="checkbox" name="todo-check" ${
      todo.isCompleted ? "checked" : ""
    } />
    <p>${todo.text}</p>
    <span class="todo-date">${todo.date}</span>
    <span class="priority ${todo.priority}"></span>
    <button class="edit-btn">
      <img src="./images/icEdit.svg" alt="icon edit" />
    </button>
    <button class="delete-btn">
      <img src="./images/icDelete.svg" alt="icon del" />
    </button>
  </div>`;
}

//
function ActivateTab(nav, section) {
  todayTodoNav.classList.remove("active");
  completedTodoNav.classList.remove("active");
  allTodoNav.classList.remove("active");

  todayTasksSec.style.display = "none";
  completedTasksSec.style.display = "none";
  allTasksSec.style.display = "none";

  //
  nav.classList.add("active");
  section.style.display = "flex";
}

nav.addEventListener("click", function (e) {
  const target = e.target;
  if (target.classList.contains("option")) {
    if (target.classList.contains("all")) {
      ActivateTab(allTodoNav, allTasksSec);
    } //
    else if (target.classList.contains("today")) {
      ActivateTab(todayTodoNav, todayTasksSec);
    } //
    else if (target.classList.contains("completed")) {
      ActivateTab(completedTodoNav, completedTasksSec);
    }
  }
});

btnAddTodo.forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelector(".modal-container")
      .setAttribute("data-scope", "add");
    document.querySelector(".modal-container").classList.add("show");
  });
});

function closeModal() {
  modalInputText.value = "";
  modalInputDate.value = "";
  modalContainer.classList.remove("show");
  modalContainer.removeAttribute("data-scope");
}

btnModalCancel.addEventListener("click", function () {
  closeModal();
});

var userInput = {
  text: "",
  date: "",
  priority: "",
};

btnModalSubmit.addEventListener("click", function () {
  if (modalInputText.value && modalInputDate.value) {
    userInput.text = modalInputText.value;
    userInput.date = modalInputDate.value;
    userInput.priority = modalInputPriority.value;

    var scope = document
      .querySelector(".modal-container")
      .getAttribute("data-scope");

    if (scope === "add") {
      fetch("/addtodo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("livelabtoken"),
          text: userInput.text,
          date: userInput.date,
          priority: userInput.priority,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setData(data.userDetails.todos);
          setHTML();
        });

      closeModal();
    } else {
      console.log("edit");
      fetch("/edittodo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: scope,
          token: localStorage.getItem("livelabtoken"),
          text: userInput.text,
          date: userInput.date,
          priority: userInput.priority,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setData(data.userDetails.todos);
          setHTML();
        });

      closeModal();
    }
  } else alert("All Fields are Required!");
});

signOutButton.addEventListener("click", function () {
  localStorage.removeItem("livelabtoken");
  window.open("./index.html", "_self");
});
