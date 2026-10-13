const API_URL = "/api/tugas";

const F = {
    title: "judul",
    course: "matkul",
    deadline: "deadline",
    completed: "selesai"
};

function pick(item, keys) {
    for (const k of keys) {
        if (item[k] !== undefined) {
            return item[k];
        }
    }
    return undefined;
}

function fromApi(item) {
    return {
        id: item.id,
        title: pick(item, [F.title, "judul", "title", "nama"]),
        course: pick(item, [F.course, "matkul", "course", "mataKuliah"]),
        deadline: pick(item, [F.deadline, "deadline", "tenggat"]),
        completed: Boolean(pick(item, [F.completed, "selesai", "completed", "done"]))
    };
}

const state = {
    status: "idle",
    tasks: [],
    error: null,
    filter: "all"
};

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const courseInput = document.getElementById("course");
const deadlineInput = document.getElementById("deadline");

const taskList = document.getElementById("taskList");
const errorMessage = document.getElementById("error");

const counter = document.getElementById("counter");
const totalTask = document.getElementById("totalTask");
const activeTask = document.getElementById("activeTask");
const doneTask = document.getElementById("doneTask");

async function api(url, options = {}) {

    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    return res.json();
}

function showMessage(text, withRetry) {

    const box = document.createElement("div");
    box.className = "empty-state";

    const p = document.createElement("p");
    p.textContent = text;
    box.appendChild(p);

    if (withRetry) {
        const retry = document.createElement("button");
        retry.type = "button";
        retry.id = "retry-btn";
        retry.textContent = "Coba lagi";
        box.appendChild(retry);
    }

    taskList.appendChild(box);
}

function render() {
    taskList.innerHTML = "";

    if (state.status === "loading") {
        showMessage("Memuat tugas...", false);
        updateCounter();
        updateStats();
        return;
    }

    if (state.status === "error") {
        showMessage("Gagal memuat: " + state.error, true);
        updateCounter();
        updateStats();
        return;
    }

    const filteredTasks = state.tasks.filter(function(task) {

        if (state.filter === "active") {
            return !task.completed;
        }

        if (state.filter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        showMessage("Belum ada tugas di kategori ini.", false);

    } else {

        filteredTasks.forEach(function(task) {

            const card = document.createElement("div");
            card.className = "task-card";

            if (task.completed) {
                card.classList.add("completed");
            }

            const top = document.createElement("div");
            top.className = "task-top";

            const titleContainer = document.createElement("div");

            const title = document.createElement("div");
            title.className = "task-title";
            title.textContent = task.title;

            const course = document.createElement("span");
            course.className = "task-course";
            course.textContent = task.course;

            titleContainer.appendChild(title);
            titleContainer.appendChild(course);
            top.appendChild(titleContainer);

            const bottom = document.createElement("div");
            bottom.className = "task-bottom";

            const deadline = document.createElement("span");
            deadline.className = "task-deadline";
            deadline.textContent = "Deadline: " + task.deadline;

            const actions = document.createElement("div");
            actions.className = "task-actions";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.dataset.id = task.id;
            checkbox.checked = task.completed;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.dataset.id = task.id;
            deleteButton.textContent = "Hapus";

            actions.appendChild(checkbox);
            actions.appendChild(deleteButton);

            bottom.appendChild(deadline);
            bottom.appendChild(actions);

            card.appendChild(top);
            card.appendChild(bottom);

            taskList.appendChild(card);
        });
    }

    updateCounter();
    updateStats();
}

function updateCounter() {

    const active = state.tasks.filter(function(task) {
        return !task.completed;
    }).length;

    counter.textContent = active;
}

function updateStats() {

    const total = state.tasks.length;

    const completed = state.tasks.filter(function(task) {
        return task.completed;
    }).length;

    totalTask.textContent = total;
    activeTask.textContent = total - completed;
    doneTask.textContent = completed;
}

async function loadTasks() {

    state.status = "loading";
    render();

    try {
        const data = await api(API_URL);
        state.tasks = data.map(fromApi);
        state.status = "success";

    } catch (err) {
        state.status = "error";
        state.error = err.message;
    }

    render();
}

document.querySelectorAll(".filter").forEach(function(button) {

    button.addEventListener("click", function() {

        document.querySelectorAll(".filter").forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        state.filter = button.dataset.filter;

        render();
    });
});

taskList.addEventListener("click", function(event) {

    if (event.target.id === "retry-btn") {
        loadTasks();
    }
});

loadTasks();