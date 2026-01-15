const params = new URLSearchParams(window.location.search);
const si = parseInt(params.get("section"));
const data = JSON.parse(localStorage.getItem("flash")) || [];
const stats = JSON.parse(localStorage.getItem("flash_stats")) || {};

if (!data[si]) window.location.href = "index.html";

const getLocalDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Mélange du deck
let deck = [...data[si].cards];
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(deck);

let ci = 0;

function showCard() {
    const card = deck[ci];
    const front = document.getElementById("cardFront");
    const back = document.getElementById("cardBack");
    const flashcard = document.getElementById("flashcard");
    
    // Contenu des cartes
    front.innerText = card.q;
    back.innerText = card.a;
    
    // Style et Reset de la rotation
    front.style.background = data[si].color;
    front.style.color = "white";
    flashcard.style.transform = "rotateY(0deg)";
    
    // Mise à jour de la BARRE DE PROGRESSION (Nouveau)
    const progressPercent = (ci / deck.length) * 100;
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    
    if (progressBar) progressBar.style.width = progressPercent + "%";
    if (progressText) progressText.innerText = `Carte ${ci + 1} sur ${deck.length}`;
}

function handleAnswer(isCorrect) {
    const currentCard = deck[ci];
    const originalCard = data[si].cards.find(c => c.q === currentCard.q);
    
    if (isCorrect) {
        if (!originalCard.level) originalCard.level = 1;
        if (originalCard.level < 5) originalCard.level++;
    } else {
        originalCard.level = 1;
    }
    
    // Sauvegarde des données
    localStorage.setItem("flash", JSON.stringify(data));
    
    // Stats (Nombre de cartes révisées aujourd'hui)
    const ds = getLocalDate(new Date());
    stats[ds] = (stats[ds] || 0) + 1;
    localStorage.setItem("flash_stats", JSON.stringify(stats));

    // Transition vers la carte suivante
    document.getElementById("flashcard").style.transform = "rotateY(0deg)";
    
    setTimeout(() => {
        ci++;
        if(ci >= deck.length) {
            // Utilisation de la barre pleine à la fin
            document.getElementById("progressBar").style.width = "100%";
            alert("Session terminée !");
            window.location.href = "index.html";
        } else {
            showCard();
        }
    }, 250);
}

function flipCard() {
    const card = document.getElementById("flashcard");
    const isFlipped = card.style.transform === "rotateY(180deg)";
    card.style.transform = isFlipped ? "rotateY(0deg)" : "rotateY(180deg)";
}

// Lancement au chargement
showCard();