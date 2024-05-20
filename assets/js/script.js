// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks_board")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const submitButton = document.querySelector("#saveTaskButton");

// Function to generate a unique task ID consisting of the date
function generateTaskId() {
  return Date.now();
}

// Function to create a task card
function createTaskCard(task) {
  let today = new Date();
  let dueDate = new Date(task.taskDueDate);
  let daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  let colorClass = "";

  if (daysRemaining < 0) {
    colorClass = "bg-danger";
  } else if (daysRemaining < 3) {
    colorClass = "bg-warning";
  }

  if (task.status === "done") {
    colorClass = "bg-light";
  }

  // Generate card
  const card = `
    <div class="card draggable mb-3 ${colorClass}" id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.taskTitle}</h5>
        <p class="card-text"><strong>Due Date:</strong> ${task.taskDueDate}</p>
        <p class="card-text">${task.taskDescription}</p>
        <button class="btn btn-danger btn-sm delete-task" data-task-id="${task.id}">Delete</button>
      </div>
    </div>
  `;

  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  // Empty the task cards containers to avoid duplicating cards
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  // Loop through each task in the task list
  taskList.forEach((task) => {
    // Create a card for the current task
    const card = createTaskCard(task);

    // Append the card to the appropriate status lane based on task status
    $(`#${task.status}-cards`).append(card);
  });

  // Add event listener for delete button on each task card if there are tasks
  if (taskList.length > 0) {
    $(".delete-task").on("click", handleDeleteTask);
  }

  // Make task cards draggable
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      // Clone the original card being dragged
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");

      // Set the width of the clone to match the original
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = $("#newTaskTitle").val().trim();
  const taskDueDate = $("#newTaskDueDate").val();
  const taskDescription = $("#newTaskDescription").val().trim();
  const task = {
    id: generateTaskId(),
    status: "todo",
    taskTitle: taskTitle,
    taskDueDate: taskDueDate,
    taskDescription: taskDescription,
  };
  taskList.push(task);

  localStorage.setItem("tasks_board", JSON.stringify(taskList)); // Save updated task list to localStorage
  renderTaskList(); // Render updated task list

  $("#customFormModal").modal('hide'); // Hide the modal after adding task

  // Reset form values
  $("#newTaskTitle").val("");
  $("#newTaskDueDate").val("");
  $("#newTaskDescription").val("");
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  $(this).closest(".card").remove();
  localStorage.setItem("tasks_board", JSON.stringify(taskList)); // Update localStorage with the updated task list
  renderTaskList(); // Render updated task list
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.helper.attr("id");
  let newStatus = $(this).attr("id");
  if (newStatus === "to-do") {
    newStatus = "todo";
  }
  taskList = taskList.map((task) => {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
    return task;
  });
  localStorage.setItem("tasks_board", JSON.stringify(taskList)); // Update localStorage with the updated task list
  renderTaskList(); // Render updated task list
}

// UI Handler for Cards
$(document).ready(function () {
  renderTaskList(); // Render initial task list

  $(submitButton).on("click", handleAddTask); // Add event listener to submit button for adding tasks

  // Make status lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  // Initialize datepicker for task due date
  $("#newTaskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
