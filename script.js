(function () {
  const addTaskBtn = document.querySelector(".add-task-btn");
  const inputField = document.querySelector(".task-input-field");
  const tasksList = document.querySelector(".tasks-list");
  const tasksCountElement = document.querySelector(
    ".main .container .title .count"
  );
  const tasksShownElement = document.querySelector(
    ".main .container .title .shown-tasks"
  );

  document.addEventListener("DOMContentLoaded", readLocalStorage);

  function readLocalStorage() {
    if (localStorage.getItem("tasks")) {
      let tasks = JSON.parse(localStorage.getItem("tasks"));
      tasks.forEach((task) => appendTaskToPage(task));
      updateTasksCountOnPage();
      updateCompletedTasksCountOnPage();
    }

    let taskSelection = "";
    if (localStorage.getItem("tasksSelection")) {
      taskSelection = localStorage.getItem("tasksSelection");
    } else {
      taskSelection = "all";
    }
    activateTaskSelection(taskSelection);
    showRequestedTasks(taskSelection);
  }

  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (inputField.value.trim()) {
      const taskName = inputField.value;
      inputField.value = "";
      addTask(taskName);
    }
  });

  function addTask(taskName) {
    const task = createTask(taskName);
    appendTaskToPage(task);
    saveTasktoLocalStorage(task);
    updateTasksCountOnPage();
    updateCompletedTasksCountOnPage();
    showRequestedTasks(localStorage.getItem("tasksSelection"));
  }

  function createTask(taskName) {
    return {
      taskName,
      id: Date.now(),
      completed: false,
    };
  }

  function appendTaskToPage(task) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.innerHTML = `<div class="task-content">
                               <div class="status ${
                                 task.completed ? "non-active" : ""
                               }">
                                <i class="fa-solid fa-check ${
                                  !task.completed ? "hidden" : ""
                                }"></i>
                               </div>
                               <div class="task-text ${
                                 task.completed ? "completed" : ""
                               }">${task.taskName}</div>
                             </div>
                             <div class="task-controls">
                              <div class="save hidden">
                                <span>save</span>
                              </div>
                              <div class="edit ${
                                task.completed ? "non-active" : ""
                              }">
                                <i class="fa-solid fa-pen"></i>
                              </div>
                              <div class="delete">
                                <i class="fa-solid fa-trash"></i>
                              </div>
                           </div>`;
    taskElement.dataset.id = task.id;
    tasksList.appendChild(taskElement);
  }

  function saveTasktoLocalStorage(task) {
    let tasks = [];
    if (localStorage.getItem("tasks"))
      tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /* Delete Task Logic */

  tasksList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete")) deleteTask(e);
    else if (e.target.classList.contains("edit")) editTask(e);
    else if (e.target.classList.contains("save")) saveTask(e);
    else if (e.target.classList.contains("status")) completeTask(e);
  });

  function deleteTask(e) {
    removeTaskFromPage(e);
    removeTaskFromLocalStorage(e.target.parentElement.parentElement.dataset.id);
    updateTasksCountOnPage();
    updateCompletedTasksCountOnPage();
    showRequestedTasks(localStorage.getItem("tasksSelection"));
  }

  function removeTaskFromPage(e) {
    e.target.parentElement.parentElement.remove();
  }

  function removeTaskFromLocalStorage(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks = tasks.filter((task) => task.id != taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /* Edit Task Logic */

  function editTask(e) {
    makeTaskEditable(e, true);
    showSaveBtn(e);
    const completedBtn =
      e.target.parentElement.parentElement.children[0].children[0];
    toggleBtnStatus(completedBtn); // deactivate check task button
    const editBtn = e.target;
    toggleBtnStatus(editBtn); // // deactivate edit task button
  }

  function makeTaskEditable(e, editable) {
    const task = e.target.parentElement.parentElement;
    const taskTextField = task.firstChild.children[1];
    taskTextField.setAttribute("contenteditable", `${editable}`);

    // // make the cursor at the end of the task text on edit
    const selection = document.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNodeContents(taskTextField);
    range.collapse(false);
    selection.addRange(range);
    taskTextField.focus();
  }

  function showSaveBtn(e) {
    e.target.parentElement.children[0].classList.remove("hidden");
  }

  /* Function factory to implement/mimic function overloading*/

  function createUpdateTaskInLocalStorageFunction(propertyName) {
    return function (taskId, propertyValue) {
      let tasks = JSON.parse(localStorage.getItem("tasks"));
      if (propertyName == "taskName") {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id == taskId) tasks[i].taskName = propertyValue;
        }
      } else if (propertyName == "taskStatus") {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id == taskId) tasks[i].completed = propertyValue;
        }
      }
      localStorage.setItem("tasks", JSON.stringify(tasks));
    };
  }

  let updateTaskNameInLocalStorage =
    createUpdateTaskInLocalStorageFunction("taskName");
  let updateTaskStatusInLocalStorage =
    createUpdateTaskInLocalStorageFunction("taskStatus");

  /* Save Task Logic */

  function saveTask(e) {
    const taskTextElement =
      e.target.parentElement.parentElement.children[0].children[1];
    if (taskTextElement.innerText) {
      const taskElement = e.target.parentElement.parentElement;
      makeTaskEditable(e, false);
      const newTaskName = taskElement.children[0].children[1].innerText;
      updateTaskNameInLocalStorage(taskElement.dataset.id, newTaskName);
      hideSaveBtn(e);
      const completedBtn =
        e.target.parentElement.parentElement.children[0].children[0];
      toggleBtnStatus(completedBtn); // activate check task button
      const editBtn = e.target.parentElement.children[1];
      toggleBtnStatus(editBtn); // activate edit task button
    }
  }

  function hideSaveBtn(e) {
    e.target.parentElement.children[0].classList.add("hidden");
  }

  /* Complete Task Logic*/

  function completeTask(e) {
    const taskElement = e.target.parentElement.parentElement;
    checkTask(e);
    updateTaskStatusInLocalStorage(taskElement.dataset.id, true);
    const completedBtn =
      e.target.parentElement.parentElement.children[0].children[0];
    toggleBtnStatus(completedBtn); // deactivate check task button
    const editBtn =
      e.target.parentElement.parentElement.children[1].children[1];
    toggleBtnStatus(editBtn); // deactivate edit task button
    updateCompletedTasksCountOnPage();
    showRequestedTasks(localStorage.getItem("tasksSelection"));
  }

  function checkTask(e) {
    const checkMark = e.target.children[0];
    checkMark.classList.remove("hidden");
    const taskTextElement = e.target.parentElement.children[1];
    taskTextElement.classList.add("completed");
  }

  function toggleBtnStatus(btn) {
    btn.classList.toggle("non-active");
  }

  /* Update Tasks Count Logic */

  function updateTasksCountOnPage() {
    tasksCountElement.innerText = getNoOfTasksFromLocalStorage();
  }

  function getNoOfTasksFromLocalStorage() {
    if (localStorage.getItem("tasks"))
      return JSON.parse(localStorage.getItem("tasks")).length;
    return 0;
  }

  function getNoOfCompletedTasksFromLocalStorage() {
    if (localStorage.getItem("tasks")) {
      let tasks = JSON.parse(localStorage.getItem("tasks"));
      let completedTasksCount = 0;
      tasks.forEach((task) => {
        if (task.completed) completedTasksCount++;
      });

      return completedTasksCount;
    }

    return 0;
  }

  /* Filter Tasks Logic (Tasks Selection) */

  tasksSelectionsListItems.forEach((taskSelectionItem) => {
    taskSelectionItem.addEventListener("click", (e) => {
      activateTaskSelection(e.target.className.replace("active", "").trim());
      showRequestedTasks(e.target.className.replace("active", "").trim());
    });
  });

  function activateTaskSelection(taskSelection) {
    const taskSelectionItem = Array.from(tasksSelectionsListItems).filter(
      (taskSelectionItem) => taskSelectionItem.classList.contains(taskSelection)
    )[0];
    tasksSelectionsListItems.forEach((taskSelectionListItem) =>
      taskSelectionListItem.classList.remove("active")
    );
    taskSelectionItem.classList.add("active");
  }

  function showRequestedTasks(taskSelection) {
    localStorage.setItem("tasksSelection", taskSelection);
    if (taskSelection == "all") {
      Array.from(tasksList.children).forEach((taskElement) =>
        taskElement.classList.remove("hidden")
      );
      tasksShownElement.innerText = "All Tasks:";
      tasksCountElement.innerText = getNoOfTasksFromLocalStorage();
    } else if (taskSelection == "completed") {
      Array.from(tasksList.children).forEach((taskElement) => {
        if (isCompleted(taskElement)) taskElement.classList.remove("hidden");
        else taskElement.classList.add("hidden");
      });
      tasksShownElement.innerText = "Completed Tasks:";
      tasksCountElement.innerText = getNoOfCompletedTasksFromLocalStorage();
    } else if (taskSelection == "uncompleted") {
      Array.from(tasksList.children).forEach((taskElement) => {
        if (!isCompleted(taskElement)) taskElement.classList.remove("hidden");
        else taskElement.classList.add("hidden");
      });
      tasksShownElement.innerText = "Uncompleted Tasks:";
      tasksCountElement.innerText =
        getNoOfTasksFromLocalStorage() -
        getNoOfCompletedTasksFromLocalStorage();
    }
  }

  function isCompleted(taskElement) {
    taskTextElement = taskElement.children[0].children[1];
    return taskTextElement.classList.contains("completed");
  }
})();
