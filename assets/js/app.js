$(document).ready(function () {
  if (localStorage.getItem("theme") === null) {
    if (window.matchMedia) {
      // Check if the dark-mode Media-Query matches
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // Dark
        changeMode("dark");
      } else {
        // Light
        changeMode();
      }
    } else {
      // Default (when Media-Queries are not supported)
      changeMode();
    }
  } else {
    let theme = localStorage.getItem("theme");
    changeMode(theme);
  }

  function changeMode(mode = "light") {
    $("#modechanger").hide(0, function () {
      $("#modechanger").fadeOut("fast");
    });

    if (mode == "dark") {
      $("body").addClass("dark");
      $("#modechanger").html('<i class="bi bi-brightness-high-fill"></i>');
      localStorage.setItem("theme", "dark");
    } else {
      $("body").removeClass("dark");
      $("#modechanger").html('<i class="bi bi-moon-fill"></i>');
      localStorage.setItem("theme", "light");
    }

    $("#modechanger").fadeIn(400);
  }

  //modechanger
  $("#modechanger").click(function () {
    if ($("body").hasClass("dark")) {
      changeMode();
    } else {
      changeMode("dark");
    }
  });

  // settodo html
  function setHtml(id, todo, completed) {
    const todoDiv = document.createElement("div");
    todoDiv.classList = "todo";
    if (completed == true) {
      todoDiv.classList = "todo todo_completed";
    }
    todoDiv.setAttribute("data-todo", id);
    todoDiv.innerHTML = `<button class="todo_check_btn">
    <i class="bi bi-check-lg"></i>
  </button>
  <div class="todo_text">
    ${todo}
  </div>
  <button class="todo_remove_btn aria-label="todoremove">
    <i class="bi bi-x-lg"></i>
  </button>`;

    const resultBody = document.querySelector("#todo_results .result_body");
    resultBody.appendChild(todoDiv);
  }

  // loadtodos
  function loadTodo(filter = "all") {
    if (localStorage.getItem("todos") !== null) {
      $("#todo_results .result_body").html("");

      todos = JSON.parse(localStorage.getItem("todos"));

      if (filter == "all") {
        todos = todos;
      } else if (filter == "completed") {
        todos = todos.filter(function (td) {
          if (td.completed == true) {
            return td;
          }
        });
      } else if (filter == "active") {
        todos = todos.filter(function (td) {
          if (td.completed == false) {
            return td;
          }
        });
      }

      if (todos.length > 0) {
        todos.forEach((todo) => {
          setHtml(todo.id, todo.todo, todo.completed);
        });
      }
      return todos;
    }
  }

  // setlocalstorage
  function setLocal(id, todoText) {
    let todos = [];

    if (localStorage.getItem("todos") !== null) {
      todos = JSON.parse(localStorage.getItem("todos"));
    }
    let todo = {
      id: id,
      todo: todoText,
      completed: false,
    };
    todos.push(todo);

    localStorage.setItem("todos", JSON.stringify(todos));
  }

  // updatetodo
  function updateTodo(id, completed = false) {
    let todos = JSON.parse(localStorage.getItem("todos"));
    let newTodos = todos.map(function (td) {
      if (td.id == id) {
        td.completed = completed;
      }
      return td;
    });

    localStorage.setItem("todos", JSON.stringify(newTodos));
  }

  // todoleft
  function todoLeft() {
    let todoRemaining = 0;
    if (localStorage.getItem("todos") !== null) {
      let todos = JSON.parse(localStorage.getItem("todos"));
      todoRemaining = todos.length;
    }

    if (todoRemaining == 0) {
      $("#todo_results").fadeOut(function () {
        $("#todo_results").css("opacity", "1");
      });
      return;
    }

    $("#todo_results").css("opacity", "1");
    $("#todo_results").fadeIn(400);

    $("#todo_left span").html(todoRemaining);
  }

  // reorderStorage
  function reorderStorage(){
    let todos = []
    let todosArray = $('#todo_results .result_body').children().toArray()

    todosArray.forEach(todoDiv => {
      let id = $(todoDiv).attr('data-todo');
      let todotext = $(todoDiv).text();
      todotext = todotext.trim()
      let todoStatus = false 

      if ($(todoDiv).hasClass("todo_completed")) {
        todoStatus = true
      }

      let todo = {
        id: id,
        todo: todotext,
        completed: todoStatus,
      };
      
      todos.push(todo)
    });

    localStorage.setItem("todos", JSON.stringify(todos));
  }

  loadTodo("all");
  todoLeft();

  // drag and drop
  $("#todo_results .result_body").sortable({
    axis: "y",
    containment: "parent",
    cursor: "grabber",
    distance: 5,
    opacity: 0.75,
    revert: 400,
    tolerance: "pointer",
    update: function( event, ui ) {
      reorderStorage()
    },
  });

  // events

  // todo form
  let id = 101;
  let idCheck = true;

  $("#todo_form").submit(function (e) {
    e.preventDefault();

    if (localStorage.getItem("todos") !== null && idCheck) {
      let todos = JSON.parse(localStorage.getItem("todos"));

      if (todos.length > 1) {
        id = todos.reduce(function (prev, current) {
          return prev.id > current.id ? prev.id : current.id;
        });

        id++;
        idCheck = false;
      }
    }

    let todo = $("#todo_inp").val();

    if (todo) {
      todo = todo.trim()
      $("#todo_form  .todo_check_btn").addClass("todo_check_btn_clicked");
      setHtml(id, todo, false);
      setLocal(id, todo);
    }

    setTimeout(function () {
      if ($("#todo_form  .todo_check_btn").hasClass("todo_check_btn_clicked")) {
        $("#todo_form  .todo_check_btn").removeClass("todo_check_btn_clicked");
        $("#todo_inp").val("");
      }
    }, 500);

    id++;
    loadTodo("all");
    removeActive();
    $("#all_todo").addClass("active");
    todoLeft();
  });

  // completeTodo
  $("body").on("click", ".todo .todo_check_btn", function (e) {
    let todoDiv = $(e.currentTarget).parent();
    let todoId = $(todoDiv).attr("data-todo");

    if ($(todoDiv).hasClass("todo_completed")) {
      updateTodo(todoId, false);
      $(todoDiv).removeClass("todo_completed");
    } else {
      updateTodo(todoId, true);
      $(todoDiv).addClass("todo_completed");
    }
  });

  // removetodo
  $("body").on("click", ".todo_remove_btn", function (e) {
    let todoDiv = $(this).parent();
    let todoId = $(todoDiv).attr("data-todo");

    let todos = JSON.parse(localStorage.getItem("todos"));

    todos = todos.filter(function (td) {
      if (td.id != todoId) {
        return td;
      }
    });

    localStorage.setItem("todos", JSON.stringify(todos));
    loadTodo("all");
    removeActive();
    $("#all_todo").addClass("active");
    todoLeft();

    let remaining = JSON.parse(localStorage.getItem("todos"));
    if (remaining.length == 0) {
      localStorage.removeItem("todos");
    }
  });

  // filter
  function removeActive() {
    document.querySelectorAll(".todo_filter button").forEach((btn) => {
      if ($(btn).hasClass("active")) {
        $(btn).removeClass("active");
      }
    });
  }

  $("#all_todo").click(function () {
    loadTodo("all");
    removeActive();
    $("#all_todo").addClass("active");
  });
  $("#active_todo").click(function () {
    loadTodo("active");
    removeActive();
    $("#active_todo").addClass("active");
  });
  $("#completed_todo").click(function () {
    loadTodo("completed");
    removeActive();
    $("#completed_todo").addClass("active");
  });

  // clearcompleted
  $("#clear_completed").click(function () {
    if (localStorage.getItem("todos") !== null) {
      let todos = JSON.parse(localStorage.getItem("todos"));

      todos = todos.filter(function (td) {
        if (td.completed == false) {
          return td;
        }
      });

      localStorage.setItem("todos", JSON.stringify(todos));
      loadTodo("all");
      removeActive();
      $("#all_todo").addClass("active");
      todoLeft();
    }

    let remaining = JSON.parse(localStorage.getItem("todos"));
    if (remaining.length == 0) {
      localStorage.removeItem("todos");
    }
  });

  // document ready
});
