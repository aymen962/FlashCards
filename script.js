// --- INITIALISATION DES DONNÉES ---
let data = JSON.parse(localStorage.getItem("flash")) || [];
let stats = JSON.parse(localStorage.getItem("flash_stats")) || {};

// Utilitaire pour obtenir la date au format YYYY-MM-DD
const getLocalDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// --- LOGIQUE DES FLASHCARDS ---
function save() {
    localStorage.setItem("flash", JSON.stringify(data));
    // Rafraîchir l'interface si les éléments existent sur la page actuelle
    if (document.getElementById("sectionList")) {
        showSections();
    }
    if (document.getElementById("multiSecSelect")) {
        refreshMultiSelect();
    }
}

function getProgressEmoji(percent) {
    if (percent === 0) return "🌑";
    if (percent < 25) return "🌱";
    if (percent < 50) return "🌿";
    if (percent < 75) return "🌳";
    return "👑";
}

function showSections() {
    const listDiv = document.getElementById("sectionList");
    if(!listDiv) return;
    listDiv.innerHTML = data.length ? "" : "<p class='text-center opacity-50'>Aucun sujet pour le moment.</p>";
    
    data.forEach((sec, i) => {
        const total = sec.cards.length;
        const currentPoints = sec.cards.reduce((acc, c) => acc + ((c.level || 1) - 1), 0);
        const percent = total > 0 ? Math.round((currentPoints / (total * 4)) * 100) : 0;
        const emoji = getProgressEmoji(percent);

        const col = document.createElement("div");
        col.className = "col-md-6 drag-item";
        col.setAttribute("data-id", i);
        col.innerHTML = `
            <div class="card border-0 shadow-sm mb-3" style="border-left: 6px solid ${sec.color} !important;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0 fw-bold text-dark">${emoji} ${sec.name}</h6>
                        <div class="btn-group">
                            <a href="quiz.html?section=${i}" class="btn btn-sm btn-outline-primary">Réviser</a>
                            <button onclick="resetSection(${i})" class="btn btn-sm btn-outline-warning">🔄</button>
                            <button onclick="deleteSection(${i})" class="btn btn-sm btn-outline-danger">×</button>
                        </div>
                    </div>
                    <div class="progress" style="height: 8px; background: rgba(0,0,0,0.05); border-radius: 10px;">
                        <div class="progress-bar" style="width: ${percent}%; background: ${sec.color}"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-1 small text-muted">
                        <span>${total} cartes</span>
                        <span class="fw-bold text-dark">${percent}%</span>
                    </div>
                </div>
            </div>`;
        listDiv.appendChild(col);
    });
    
    if(document.getElementById("totalSectionsDisplay")) {
        document.getElementById("totalSectionsDisplay").innerText = data.length + " Sujets";
    }
    initSortable();
}

function initSortable() {
    const el = document.getElementById('sectionList');
    if (!el || typeof Sortable === 'undefined') return;
    Sortable.create(el, {
        animation: 150,
        onEnd: function () {
            const items = el.querySelectorAll('.drag-item');
            const newData = [];
            items.forEach(item => newData.push(data[item.getAttribute('data-id')]));
            data = newData;
            localStorage.setItem("flash", JSON.stringify(data));
            showSections();
        }
    });
}

// --- STATISTIQUES ---
function calculateStreaks() {
    let currentStreak = 0;
    let curr = new Date();
    // Si pas de stats aujourd'hui, on regarde hier
    if (!stats[getLocalDate(curr)]) curr.setDate(curr.getDate() - 1);
    while(stats[getLocalDate(curr)]) { 
        currentStreak++; 
        curr.setDate(curr.getDate() - 1); 
    }
    
    if(document.getElementById("streakBadge")) {
        document.getElementById("streakBadge").innerText = `🔥 ${currentStreak}`;
    }

    let maxStudySeconds = parseInt(localStorage.getItem("study_max_time")) || 0;
    if(document.getElementById("timerMaxBadge")) {
        const h = Math.floor(maxStudySeconds / 3600);
        const m = Math.floor((maxStudySeconds % 3600) / 60);
        document.getElementById("timerMaxBadge").innerText = h > 0 ? `${h}h${m}` : `${m}m`;
    }
}

// --- GESTION DES SUJETS ---
function addSection() {
    const nameInput = document.getElementById("secName");
    const colorInput = document.getElementById("secColor");
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    const color = colorInput.value;
    
    if (!name) return;
    data.push({ name, color, cards: [] });
    save();
    nameInput.value = "";
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

function deleteSection(i) { 
    if(confirm("Supprimer ce sujet et toutes ses cartes ?")) { 
        data.splice(i, 1); 
        save(); 
    } 
}

function resetSection(i) {
    if(confirm(`Réinitialiser la progression de "${data[i].name}" ?`)) {
        data[i].cards.forEach(card => card.level = 1);
        save();
    }
}

function refreshMultiSelect() {
    const s = document.getElementById("multiSecSelect");
    if(s) {
        s.innerHTML = data.map((sec, i) => `<option value="${i}">${sec.name}</option>`).join("");
    }
}

// --- ASSISTANT ---
const motivationPhrases = [
    "2 minutes de travail ! Tu es sur la bonne voie ! 💪",
    "La persévérance paie toujours. Continue ! ✨",
    "Tu fais des progrès incroyables aujourd'hui ! 🔥",
    "Reste concentré, tu y es presque ! 🧠",
    "N'oublie pas : chaque petit pas compte. 🏆"
];

function initAssistant() {
    if (document.querySelector('.assistant-container')) return;
    const container = document.createElement('div');
    container.className = 'assistant-container';
    container.innerHTML = `
        <div class="assistant-bubble" id="assistantBubble" style="display: none;"></div>
        <div class="assistant-avatar" onclick="toggleAssistantBubble()">🤖</div>
    `;
    document.body.appendChild(container);
}

function toggleAssistantBubble() {
    const b = document.getElementById("assistantBubble");
    if (b.style.display === "none" || b.style.display === "") {
        b.innerText = motivationPhrases[Math.floor(Math.random() * motivationPhrases.length)];
        b.style.display = "block";
    } else {
        b.style.display = "none";
    }
}

// --- INITIALISATION AU CHARGEMENT ---
function init() {
    initAssistant();
    calculateStreaks();

    if (document.getElementById("sectionList")) {
        showSections();
    }
    if (document.getElementById("multiSecSelect")) {
        refreshMultiSelect();
    }
}

window.addEventListener('DOMContentLoaded', init);