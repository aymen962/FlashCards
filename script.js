let data = JSON.parse(localStorage.getItem("flash")) || [];
let stats = JSON.parse(localStorage.getItem("flash_stats")) || {};

const getLocalDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function save() {
    localStorage.setItem("flash", JSON.stringify(data));
    showSections();
    refreshMultiSelect();
}

// --- LOGIQUE DES EMOJIS ---
function getProgressEmoji(percent) {
    if (percent === 0) return "🌑";
    if (percent < 25) return "🌱";
    if (percent < 50) return "🌿";
    if (percent < 75) return "🌳";
    return "👑";
}

// --- AFFICHAGE DES SECTIONS ---
function showSections() {
    const listDiv = document.getElementById("sectionList");
    if(!listDiv) return;
    listDiv.innerHTML = data.length ? "" : "<p class='text-center opacity-50'>Aucun sujet pour le moment.</p>";
    
    data.forEach((sec, i) => {
        const total = sec.cards.length;
        const currentPoints = sec.cards.reduce((acc, c) => acc + ((c.level || 1) - 1), 0);
        const maxPoints = total * 4; 
        const percent = total > 0 ? Math.round((currentPoints / maxPoints) * 100) : 0;
        const emoji = getProgressEmoji(percent);

        const col = document.createElement("div");
        col.className = "col-md-6 drag-item";
        col.setAttribute("data-id", i);
        col.innerHTML = `
            <div class="card border-0 shadow-sm" style="border-left: 6px solid ${sec.color}; background: white; cursor: grab;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0 fw-bold text-dark">${emoji} ${sec.name}</h6>
                        <div class="btn-group">
                            <a href="quiz.html?section=${i}" class="btn btn-sm btn-outline-primary">Réviser</a>
                            <button onclick="resetSection(${i})" class="btn btn-sm btn-outline-warning">🔄</button>
                            <button onclick="deleteSection(${i})" class="btn btn-sm btn-outline-danger">×</button>
                        </div>
                    </div>
                    <div class="progress" style="height: 8px; background: #eee; border-radius: 10px;">
                        <div class="progress-bar progress-bar-striped" style="width: ${percent}%; background: ${sec.color}"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-1 small text-muted" style="font-size: 0.75rem;">
                        <span>${total} cartes</span>
                        <span class="text-dark fw-bold">${percent}% Maîtrise</span>
                    </div>
                </div>
            </div>`;
        listDiv.appendChild(col);
    });
    document.getElementById("totalSections").innerText = data.length;
    initSortable();
}

// --- DRAG AND DROP ---
function initSortable() {
    const el = document.getElementById('sectionList');
    if (!el) return;
    Sortable.create(el, {
        animation: 150,
        onEnd: function () {
            const items = el.querySelectorAll('.drag-item');
            const newData = [];
            items.forEach(item => newData.push(data[item.getAttribute('data-id')]));
            data = newData;
            localStorage.setItem("flash", JSON.stringify(data));
            showSections();
            refreshMultiSelect();
        }
    });
}

// --- STATS / STREAKS ---
function calculateStreaks() {
    let currentStreak = 0;
    let maxStreak = parseInt(localStorage.getItem("max_streak")) || 0;
    let curr = new Date();
    if (!stats[getLocalDate(curr)]) curr.setDate(curr.getDate() - 1);
    while(stats[getLocalDate(curr)]) { currentStreak++; curr.setDate(curr.getDate() - 1); }
    if (currentStreak > maxStreak) { maxStreak = currentStreak; localStorage.setItem("max_streak", maxStreak); }
    document.getElementById("streakBadge").innerText = `🔥 ${currentStreak}`;
    document.getElementById("maxStreakBadge").innerText = `🏆 ${maxStreak}`;
}

// --- ACTIONS ---
function addSection() {
    const name = document.getElementById("secName").value.trim();
    const color = document.getElementById("secColor").value;
    if (!name) return;
    data.push({ name, color, cards: [] });
    save();
    document.getElementById("secName").value = "";
}

function addMultipleCards() {
    const idx = document.getElementById("multiSecSelect").value;
    const text = document.getElementById("multiCards").value;
    if (!text || idx === "") return;
    text.split("\n").forEach(line => {
        const parts = line.split(",");
        if (parts.length >= 2) {
            data[idx].cards.push({ q: parts[0].trim(), a: parts[1].trim(), level: 1 });
        }
    });
    document.getElementById("multiCards").value = "";
    save();
}

function deleteSection(i) { if(confirm("Supprimer ce sujet ?")) { data.splice(i, 1); save(); } }

function resetSection(i) {
    if(confirm(`Réinitialiser la progression de "${data[i].name}" ?`)) {
        data[i].cards.forEach(card => card.level = 1);
        save();
    }
}

function refreshMultiSelect() {
    const s = document.getElementById("multiSecSelect");
    if(s) s.innerHTML = data.map((sec, i) => `<option value="${i}">${sec.name}</option>`).join("");
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("dark", isDark);
}

// --- INITIALISATION ---
window.onload = () => {
    if(localStorage.getItem("dark") === "true") document.body.classList.add("dark-mode");
    showSections();
    refreshMultiSelect();
    calculateStreaks();
};