let todos = JSON.parse(localStorage.getItem("simple_todos")) || [];
let selectedEmoji = "🎯";
const emojis = ["🎯","📚","💻","💪","🎨","🧪","🧘","🏃","✅","🔥","🍕","⭐","💡","🛠️","💰","📅","🏆","🚀","🎉","🏠","🤩","✍️","📖","🎯","🌟"];
const todayStr = new Date().toDateString();

// Init Sélecteur
const popover = document.getElementById('emojiPopover');
emojis.forEach(em => {
    const span = document.createElement('span');
    span.className = 'emoji-option';
    span.innerText = em;
    span.onclick = () => {
        selectedEmoji = em;
        document.getElementById('currentEmojiDisplay').innerText = em;
        popover.style.display = 'none';
    };
    popover.appendChild(span);
});

function toggleEmojiPicker() {
    const p = document.getElementById('emojiPopover');
    p.style.display = (p.style.display === 'grid') ? 'none' : 'grid';
}

// Reset Quotidien
if (localStorage.getItem("last_todo_date") !== todayStr) {
    todos.forEach(t => { if (t.everyday) t.done = false; });
    localStorage.setItem("last_todo_date", todayStr);
    saveTodos();
}

function saveTodos() {
    localStorage.setItem("simple_todos", JSON.stringify(todos));
    renderTodos();
}

function addTodo() {
    const input = document.getElementById("todoInput");
    if (!input.value.trim()) return;
    todos.push({
        id: Date.now(),
        text: input.value.trim(),
        emoji: selectedEmoji,
        priority: document.getElementById("taskPriority").value,
        everyday: document.getElementById("isEveryday").checked,
        done: false, streak: 0, maxStreak: 0, order: todos.length
    });
    input.value = "";
    saveTodos();
}

function toggleTodo(id) {
    todos = todos.map(t => {
        if (t.id === id) {
            t.done = !t.done;
            if (t.everyday && t.done) {
                t.streak++;
                if (t.streak > t.maxStreak) t.maxStreak = t.streak;
            }
        }
        return t;
    });
    saveTodos();
}

function editTask(id) {
    const task = todos.find(t => t.id === id);
    const newVal = prompt("Modifier la tâche :", task.text);
    if (newVal) { task.text = newVal; saveTodos(); }
}

function deleteTodo(id) {
    if(confirm("Supprimer ?")) { todos = todos.filter(t => t.id !== id); saveTodos(); }
}

function renderTodos() {
    const listDiv = document.getElementById("todoList");
    listDiv.innerHTML = "";
    todos.sort((a, b) => a.order - b.order);

    let doneCount = 0;
    todos.forEach(t => {
        if (t.done) doneCount++;
        const div = document.createElement("div");
        div.className = `card quest-card border-0 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center priority-${t.priority} ${t.done ? 'opacity-50' : ''}`;
        div.setAttribute("data-id", t.id);
        div.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <input type="checkbox" class="form-check-input" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})" style="width:22px; height:22px;">
                <span style="font-size: 1.4rem;">${t.emoji}</span>
                <div>
                    <span class="fw-bold ${t.done ? 'text-decoration-line-through' : ''}" onclick="editTask(${t.id})" style="cursor:pointer">${t.text}</span>
                    ${t.everyday ? `<div class="mt-1"><span class="fire-badge">🔥 ${t.streak}</span><span class="max-badge">Max: ${t.maxStreak}</span></div>` : ''}
                </div>
            </div>
            <button class="btn btn-sm text-danger opacity-50" onclick="deleteTodo(${t.id})">×</button>
        `;
        listDiv.appendChild(div);
    });

    // Mise à jour de la BARRE
    const percent = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;
    document.getElementById("todoBar").style.width = percent + "%";
    document.getElementById("todoStats").innerText = `${doneCount} / ${todos.length} fait`;
    document.getElementById("todoMotto").innerText = percent === 100 ? "Parfait ! ✨" : "Continue ! 💪";
}

Sortable.create(document.getElementById('todoList'), {
    animation: 150,
    onEnd: function () {
        const items = document.getElementById('todoList').querySelectorAll('[data-id]');
        items.forEach((item, index) => {
            const id = parseInt(item.getAttribute('data-id'));
            todos.find(t => t.id === id).order = index;
        });
        localStorage.setItem("simple_todos", JSON.stringify(todos));
    }
});

renderTodos();