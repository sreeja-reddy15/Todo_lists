const API = "http://localhost:8080";
let tasks = [];

function $(id) {
    return document.getElementById(id);
}

function showLogin() {
    $("loginPanel").classList.remove("hidden");
    $("registerPanel").classList.add("hidden");
    $("loginMessage").textContent = "";
}

function showRegister() {
    $("loginPanel").classList.add("hidden");
    $("registerPanel").classList.remove("hidden");
    $("registerMessage").textContent = "";
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
}

async function register() {
    const username = $("registerUsername").value.trim();
    const password = $("registerPassword").value;
    const message = $("registerMessage");

    if (!username || !password) {
        message.textContent = "Please enter username and password.";
        return;
    }

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        });

        const result = await response.text();
        message.textContent = result;

        if (response.ok) {
            showToast("Account created successfully");
            setTimeout(showLogin, 700);
        }
    } catch {
        message.textContent = "Backend is not reachable. Start Spring Boot first.";
    }
}

async function login() {
    const username = $("loginUsername").value.trim();
    const password = $("loginPassword").value;
    const message = $("loginMessage");

    if (!username || !password) {
        message.textContent = "Please enter username and password.";
        return;
    }

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            message.textContent = result || "Invalid username or password.";
            return;
        }

        sessionStorage.setItem("username", username);
        openApp();
    } catch {
        message.textContent = "Backend is not reachable. Start Spring Boot first.";
    }
}

function openApp() {
    const username = sessionStorage.getItem("username");
    if (!username) return;

    $("authScreen").classList.add("hidden");
    $("appScreen").classList.remove("hidden");
    $("welcomeUser").textContent = username;
    updateDate();
    loadTasks();
}

function logout() {
    sessionStorage.removeItem("username");
    tasks = [];
    $("appScreen").classList.add("hidden");
    $("authScreen").classList.remove("hidden");
    $("loginPassword").value = "";
    showToast("Logged out successfully");
}

function updateDate() {
    const now = new Date();
    $("todayDate").textContent = now.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const hour = now.getHours();
    $("greeting").textContent =
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" : "Good evening";
}

async function loadTasks() {
    const username = sessionStorage.getItem("username");
    if (!username) return;

    try {
        const response = await fetch(`${API}/tasks?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error();
        tasks = await response.json();
        renderTasks();
        updateStats();
    } catch {
        showToast("Could not load tasks");
    }
}

async function addTask() {
    const username = sessionStorage.getItem("username");
    const title = $("taskTitle").value.trim();

    if (!title) {
        showToast("Enter a task title");
        return;
    }

    const deadline = $("taskDeadline").value || null;
    const priority = $("taskPriority").value;
    const category = $("taskCategory").value;
    const recurrence = $("taskRecurrence").value;
    const dailyRoutine = $("dailyRoutine").checked;

    const task = {
        username,
        title,
        description: $("taskDescription").value.trim(),
        deadline,
        priority,
        category,
        recurrence: dailyRoutine ? "DAILY" : recurrence,
        dailyRoutine,
        completed: false
    };

    try {
        const response = await fetch(`${API}/tasks`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            showToast(await response.text());
            return;
        }

        clearForm();
        showToast(dailyRoutine ? "Daily routine added" : "Task added");
        await loadTasks();
    } catch {
        showToast("Could not connect to backend");
    }
}

function clearForm() {
    $("taskTitle").value = "";
    $("taskDescription").value = "";
    $("taskDeadline").value = "";
    $("taskPriority").value = "MEDIUM";
    $("taskCategory").value = "Academic";
    $("taskRecurrence").value = "NONE";
    $("dailyRoutine").checked = false;
}

function isOverdue(task) {
    return !task.completed && task.deadline && new Date(task.deadline) < new Date();
}

function formatDeadline(value) {
    if (!value) return "No deadline";
    const date = new Date(value);
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit"
    });
}

function renderTasks() {
    const filter = $("filter").value;
    const list = $("taskList");
    const empty = $("emptyState");

    let visible = [...tasks];

    if (filter === "PENDING") {
        visible = visible.filter(t => !t.completed);
    } else if (filter === "COMPLETED") {
        visible = visible.filter(t => t.completed);
    } else if (filter === "ROUTINE") {
        visible = visible.filter(t => t.dailyRoutine);
    } else if (filter === "OVERDUE") {
        visible = visible.filter(isOverdue);
    }

    list.innerHTML = "";

    if (visible.length === 0) {
        empty.classList.remove("hidden");
    } else {
        empty.classList.add("hidden");
    }

    visible.forEach(task => {
        const item = document.createElement("article");
        item.className = "task-item";

        const priorityClass = `priority-${(task.priority || "MEDIUM").toLowerCase()}`;
        const overdueClass = isOverdue(task) ? "overdue" : "";

        item.innerHTML = `
            <div class="task-main">
                <input class="complete-check" type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id}, this.checked)">
                <div class="task-content">
                    <p class="task-title ${task.completed ? "completed" : ""}">
                        ${escapeHtml(task.title)}
                    </p>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ""}
                    <div class="task-meta">
                        <span class="badge ${priorityClass}">${escapeHtml(task.priority || "MEDIUM")}</span>
                        <span class="badge">${escapeHtml(task.category || "General")}</span>
                        <span class="badge ${overdueClass}">⏱ ${formatDeadline(task.deadline)}</span>
                        ${task.dailyRoutine ? `<span class="badge">↻ Daily Routine</span>` : ""}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="small-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        list.appendChild(item);
    });

    $("taskSummary").textContent =
        `${visible.length} ${visible.length === 1 ? "task" : "tasks"}`;
}

async function toggleTask(id, completed) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updated = {...task, completed};

    try {
        const response = await fetch(
            `${API}/tasks/${id}?username=${encodeURIComponent(task.username)}`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(updated)
            }
        );

        if (!response.ok) throw new Error();

        await loadTasks();
    } catch {
        showToast("Could not update task");
        await loadTasks();
    }
}

async function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm(`Delete "${task.title}"?`)) return;

    try {
        const response = await fetch(
            `${API}/tasks/${id}?username=${encodeURIComponent(task.username)}`,
            {method: "DELETE"}
        );

        if (!response.ok) throw new Error();

        showToast("Task deleted");
        await loadTasks();
    } catch {
        showToast("Could not delete task");
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(isOverdue).length;

    $("totalCount").textContent = total;
    $("pendingCount").textContent = pending;
    $("completedCount").textContent = completed;
    $("overdueCount").textContent = overdue;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("username")) {
        openApp();
    }
});
