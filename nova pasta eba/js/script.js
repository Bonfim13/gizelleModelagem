const taskForm = document.querySelector("#form-tarefa");
const filterForm = document.querySelector("#form-filtro");
const filterSelect = document.querySelector("#filtro-status");
const taskList = document.querySelector("#lista-tarefas");
const emptyState = document.querySelector("#estado-vazio");
const taskFeedback = document.querySelector("#tarefa-feedback");
const loginForm = document.querySelector("#form-login");
const registerForm = document.querySelector("#form-cadastro");
const authGrid = document.querySelector(".auth-grid");
const tasksSection = document.querySelector("#tarefas");
const connectedUser = document.querySelector("#usuario-conectado");
const accounts = [];
const tasks = [];
let activeUser = null;

const statusLabels = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const email = formData.get("email").trim().toLowerCase();
  const feedback = registerForm.querySelector(".form-feedback");

  if (accounts.some((account) => account.email === email)) {
    feedback.textContent = "Já existe uma conta com este e-mail.";
    return;
  }

  accounts.push({
    name: formData.get("nome").trim(),
    email,
    password: formData.get("senha"),
  });
  registerForm.reset();
  feedback.textContent = "Conta criada. Agora entre usando seu e-mail e senha.";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get("email").trim().toLowerCase();
  const account = accounts.find(
    (item) => item.email === email && item.password === formData.get("senha"),
  );
  const feedback = loginForm.querySelector(".form-feedback");

  if (!account) {
    feedback.textContent = "E-mail ou senha incorretos. Crie uma conta antes de entrar.";
    return;
  }

  activeUser = account;
  feedback.textContent = "";
  loginForm.reset();
  connectedUser.textContent = account.name;
  authGrid.hidden = true;
  tasksSection.hidden = false;
  renderTasks();
});

document.querySelector("#botao-sair").addEventListener("click", () => {
  activeUser = null;
  tasksSection.hidden = true;
  authGrid.hidden = false;
  loginForm.querySelector(".form-feedback").textContent = "Você saiu da sua conta.";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  tasks.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: formData.get("titulo").trim(),
    description: formData.get("descricao").trim(),
    dueDate: formData.get("prazo"),
    status: formData.get("status"),
    owner: activeUser.email,
  });

  taskForm.reset();
  taskFeedback.textContent = "Tarefa adicionada.";
  renderTasks();
});

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderTasks();
});

filterSelect.addEventListener("change", renderTasks);

taskList.addEventListener("change", (event) => {
  const select = event.target.closest("[data-task-status]");
  if (!select) return;

  const task = tasks.find((item) => item.id === select.dataset.taskStatus);
  if (!task) return;

  task.status = select.value;
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-task]");
  if (!button) return;

  const taskIndex = tasks.findIndex((task) => task.id === button.dataset.deleteTask);
  if (taskIndex < 0) return;

  tasks.splice(taskIndex, 1);
  taskFeedback.textContent = "Tarefa excluída.";
  renderTasks();
});

function renderTasks() {
  const selectedStatus = filterSelect.value;
  const userTasks = tasks.filter((task) => task.owner === activeUser.email);
  const visibleTasks = userTasks.filter(
    (task) => selectedStatus === "TODAS" || task.status === selectedStatus,
  );

  taskList.replaceChildren(...visibleTasks.map(createTaskCard));
  emptyState.hidden = visibleTasks.length > 0;
  document.querySelector("#total-tarefas").textContent = userTasks.length;
  document.querySelector("#andamento-tarefas").textContent = userTasks.filter(
    (task) => task.status === "EM_ANDAMENTO",
  ).length;
  document.querySelector("#concluidas-tarefas").textContent = userTasks.filter(
    (task) => task.status === "CONCLUIDA",
  ).length;
}

function createTaskCard(task) {
  const item = document.createElement("li");
  item.className = `task-card${task.status === "CONCLUIDA" ? " is-complete" : ""}`;

  const details = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = task.title;
  details.append(title);

  if (task.description) {
    const description = document.createElement("p");
    description.textContent = task.description;
    details.append(description);
  }

  if (task.dueDate) {
    const dueDate = document.createElement("p");
    dueDate.className = "task-due";
    dueDate.textContent = `Prazo: ${formatDate(task.dueDate)}`;
    details.append(dueDate);
  }

  const controls = document.createElement("div");
  controls.className = "task-card-controls";

  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("aria-label", `Status de ${task.title}`);
  statusSelect.dataset.taskStatus = task.id;
  Object.entries(statusLabels).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = task.status === value;
    statusSelect.append(option);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir tarefa";
  deleteButton.dataset.deleteTask = task.id;

  controls.append(statusSelect, deleteButton);
  item.append(details, controls);
  return item;
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
