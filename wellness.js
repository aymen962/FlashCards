const CURRENT_YEAR = 2026;
const todayID = new Date().toISOString().split('T')[0];
let selectedVibe = { emoji: "😐", color: "#94a3b8", label: "Neutre" };

function selectVibe(emoji, color, label, el) {
    selectedVibe = { emoji, color, label };
    document.querySelectorAll('.mood-vibe').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
}

function validateVibe() {
    const gratitude = document.getElementById('gratitudeInput').value;
    
    const entry = {
        mood: selectedVibe.emoji,
        color: selectedVibe.color,
        gratitude: gratitude || "Belle journée"
    };

    let history = JSON.parse(localStorage.getItem('wellness_2026')) || {};
    history[todayID] = entry;
    localStorage.setItem('wellness_2026', JSON.stringify(history));

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [selectedVibe.color, '#ffffff']
    });

    renderGrid();
    updateStreak();
}

function renderGrid() {
    const grid = document.getElementById('yearGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('wellness_2026')) || {};
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    months.forEach((name, m) => {
        const col = document.createElement('div');
        col.className = 'month-col';
        col.innerHTML = `<div class="month-label">${name}</div>`;

        const days = new Date(CURRENT_YEAR, m + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
            const id = `${CURRENT_YEAR}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const sq = document.createElement('div');
            sq.className = 'day-sq';
            if(history[id]) {
                sq.style.backgroundColor = history[id].color;
                sq.style.boxShadow = `0 0 8px ${history[id].color}44`;
                sq.title = `${history[id].mood} : ${history[id].gratitude}`;
            }
            col.appendChild(sq);
        }
        grid.appendChild(col);
    });
}

function updateStreak() {
    const history = JSON.parse(localStorage.getItem('wellness_2026')) || {};
    const count = Object.keys(history).length;
    document.getElementById('streakBadge').innerText = `🔥 ${count} JOURS`;
}

window.onload = () => {
    renderGrid();
    updateStreak();
};