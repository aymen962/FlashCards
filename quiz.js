const params = new URLSearchParams(window.location.search);
const si = parseInt(params.get("section"));
const data = JSON.parse(localStorage.getItem("flash")) || [];
const stats = JSON.parse(localStorage.getItem("flash_stats")) || {};

// Vérification de sécurité
if (isNaN(si) || !data[si]) window.location.href = "flashcards.html";

const getLocalDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Préparation du deck
let deck = [...data[si].cards];
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
shuffle(deck);

let ci = 0;

function showCard() {
    if (ci >= deck.length) return;

    const card = deck[ci];
    const flashcard = document.getElementById("flashcard");
    const front = document.getElementById("cardFront");
    const back = document.getElementById("cardBack");

    // RESET INSTANTANÉ (Vitesse maximale)
    flashcard.style.transition = "none";
    flashcard.classList.remove("flipped");

    // Changement du texte
    front.innerText = card.q;
    back.innerText = card.a;
    front.style.background = data[si].color || "#6366f1";
    front.style.color = "white";

    // Forcer le rendu puis réactiver l'animation
    void flashcard.offsetWidth; 
    flashcard.style.transition = "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";

    // Update Progress
    const progressPercent = (ci / deck.length) * 100;
    document.getElementById("progressBar").style.width = progressPercent + "%";
    document.getElementById("progressText").innerText = `CARTE ${ci + 1} / ${deck.length}`;
}

function handleAnswer(isCorrect) {
    // Sauvegarde de la progression
    const originalCard = data[si].cards.find(c => c.q === deck[ci].q);
    if (originalCard) {
        originalCard.level = isCorrect ? Math.min((originalCard.level || 1) + 1, 5) : 1;
    }
    
    localStorage.setItem("flash", JSON.stringify(data));
    const ds = getLocalDate(new Date());
    stats[ds] = (stats[ds] || 0) + 1;
    localStorage.setItem("flash_stats", JSON.stringify(stats));

    // Passage à la suite
    ci++;
    if(ci >= deck.length) {
        alert("Session terminée ! 🎯");
        window.location.href = "flashcards.html"; // Retour direct ici aussi
    } else {
        showCard();
    }
}

function flipCard() {
    document.getElementById("flashcard").classList.toggle("flipped");
}

window.onload = showCard;