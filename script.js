let appData = {
    player: {
        name: 'Learner',
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalReviews: 0,
        streak: 0,
        lastReviewDate: null,
        masteredCards: 0
    },
    decks: [],
    cards: []
};
let currentSession = {
    cards: [],
    currentIndex: 0,
    startTime: null,
    correctCount: 0,
    reviewedCount: 0
};

function init() {
    loadData();
    checkStreak();
    updateUI()
}

function loadData() {
    const s = localStorage.getItem('linguaflash');
    if (s) appData = JSON.parse(s)
}

function saveData() {
    localStorage.setItem('linguaflash', JSON.stringify(appData));
    updateUI()
}

function editPlayerName() {
    const n = prompt('Enter username:', appData.player.name);
    if (n && n.trim()) {
        appData.player.name = n.trim();
        saveData()
    }
}

function addXP(amount) {
    appData.player.xp += amount;
    appData.player.totalReviews++;
    let up = false;
    while (appData.player.xp >= appData.player.xpToNext) {
        appData.player.xp -= appData.player.xpToNext;
        appData.player.level++;
        appData.player.xpToNext = Math.floor(appData.player.xpToNext * 1.5);
        up = true
    }
    return up
}

function checkStreak() {
    const t = new Date().toDateString();
    if (appData.player.lastReviewDate !== t) {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        if (appData.player.lastReviewDate !== y.toDateString() && appData.player.lastReviewDate) appData.player.streak = 0
    }
}

function updateStreak() {
    const t = new Date().toDateString();
    if (appData.player.lastReviewDate !== t) {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        if (appData.player.lastReviewDate === y.toDateString()) appData.player.streak++;
        else if (!appData.player.lastReviewDate || appData.player.streak === 0) appData.player.streak = 1;
        appData.player.lastReviewDate = t
    }
}

function selectCardsForSession(deckId = null) {
    const now = Date.now(),
        dayMs = 864e5;
    let eligible = appData.cards.filter(c => !deckId || c.deckId === deckId);
    const scored = eligible.map(c => {
        let s = 0;
        const lr = c.lastReview || 0,
            i = c.interval || 0,
            due = lr + (i * dayMs);
        if (now > due) s += 1000 + ((now - due) / dayMs) * 100;
        if (c.easeFactor < 2) s += 500;
        if (!c.lastReview || c.reviewCount === 0) s += 300;
        s += (10 - Math.min(c.reviewCount || 0, 10)) * 50;
        if (now <= due && due - now < dayMs) s += 200;
        return {
            card: c,
            score: s
        }
    });
    scored.sort((a, b) => b.score - a.score);
    const sel = [],
        seen = new Set();
    for (const item of scored) {
        if (sel.length >= 10) break;
        if (!seen.has(item.card.id)) {
            sel.push(item.card);
            seen.add(item.card.id)
        }
    }
    return sel
}

function startStudySession(deckId = null) {
    currentSession.cards = selectCardsForSession(deckId);
    if (currentSession.cards.length === 0) {
        alert('No cards! Add some first.');
        return
    }
    currentSession.currentIndex = 0;
    currentSession.startTime = Date.now();
    currentSession.correctCount = 0;
    currentSession.reviewedCount = 0;
    showView('study');
    showCard()
}

function showCard() {
    const c = currentSession.cards[currentSession.currentIndex];
    if (!c) {
        completeSession();
        return
    }
    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('cardFront').textContent = c.front;
    document.getElementById('cardBack').textContent = c.back;
    document.getElementById('cardExample').textContent = c.example || '';
    document.getElementById('gradeButtons').style.display = 'none';
    document.getElementById('currentCardNum').textContent = currentSession.currentIndex + 1;
    document.getElementById('totalCardsNum').textContent = currentSession.cards.length;
    document.getElementById('studyProgress').style.width = (currentSession.currentIndex / currentSession.cards.length * 100) + '%'
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    if (document.getElementById('flashcard').classList.contains('flipped')) document.getElementById('gradeButtons').style.display = 'flex'
}

function gradeCard(g) {
    const c = currentSession.cards[currentSession.currentIndex];
    const now = Date.now();
    c.reviewCount = (c.reviewCount || 0) + 1;
    c.lastReview = now;
    let xp = 0,
        ok = false;
    if (g === 'again') {
        c.interval = 1;
        c.easeFactor = Math.max(1.3, (c.easeFactor || 2.5) - .2);
        xp = 5
    } else if (g === 'good') {
        c.interval = 3;
        c.easeFactor = (c.easeFactor || 2.5) + .1;
        xp = 10;
        ok = true
    } else {
        c.interval = 7;
        c.easeFactor = (c.easeFactor || 2.5) + .3;
        xp = 15;
        ok = true
    }
    currentSession.reviewedCount++;
    if (ok) currentSession.correctCount++;
    const up = addXP(xp);
    if (c.interval >= 7) appData.player.masteredCards = appData.cards.filter(x => x.interval >= 7).length;
    updateStreak();
    saveData();
    currentSession.currentIndex++;
    if (currentSession.currentIndex < currentSession.cards.length) setTimeout(showCard, 300);
    else setTimeout(() => completeSession(up), 500)
}

function completeSession(up = false) {
    const end = Date.now(),
        time = Math.floor((end - currentSession.startTime) / 1e3),
        acc = currentSession.reviewedCount > 0 ? Math.round((currentSession.correctCount / currentSession.reviewedCount) * 100) : 0,
        xpEarned = currentSession.correctCount * 10 + (currentSession.reviewedCount - currentSession.correctCount) * 5;
    document.getElementById('sessionReviewed').textContent = currentSession.reviewedCount;
    document.getElementById('sessionAccuracy').textContent = acc + '%';
    document.getElementById('sessionTime').textContent = Math.floor(time / 60) + ':' + (time % 60).toString().padStart(2, '0');
    document.getElementById('sessionXP').textContent = '+' + xpEarned;
    if (up) {
        document.getElementById('newLevel').textContent = appData.player.level;
        document.getElementById('levelUpNotification').style.display = 'block';
        startConfetti()
    } else if (acc >= 80) startConfetti();
    showView('sessionComplete')
}

function renderDecks() {
    const dl = document.getElementById('deckList');
    dl.innerHTML = '';
    appData.decks.forEach(d => {
        const cc = appData.cards.filter(c => c.deckId === d.id).length,
            dc = appData.cards.filter(c => c.deckId === d.id && Date.now() >= (c.lastReview || 0) + ((c.interval || 0) * 864e5)).length;
        const card = document.createElement('div');
        card.className = 'deck-card';
        card.innerHTML = '<div class=\"deck-header\"><div class=\"deck-title\">' + escapeHtml(d.name) + '</div><div><button class=\"btn-small btn-edit\" onclick=\"editDeck(\\'
        '+d.id+'\\
        ')\">Edit</button><button class=\"btn-small btn-delete\" onclick=\"deleteDeck(\\'
        '+d.id+'\\
        ')\">Delete</button></div></div><div style=\"color:var(--text-light);margin-bottom:1rem\">' + escapeHtml(d.description || '') + '</div><div style=\"display:flex;gap:1rem;font-size:.875rem;color:var(--text-light)\"><span>📚 ' + cc + ' cards</span><span>⏰ ' + dc + ' due</span></div><button class=\"btn-primary\" onclick=\"startStudySession(\\'
        '+d.id+'\\
        ')\" style=\"margin-top:1rem;width:100%\">Study</button><button class=\"btn-success\" onclick=\"showCardModal(\\'
        '+d.id+'\\
        ')\" style=\"margin-top:.5rem;width:100%\">+ Add Card</button>';
        dl.appendChild(card)
    })
}

function saveDeck(e) {
    e.preventDefault();
    const id = document.getElementById('deckId').value,
        name = document.getElementById('deckName').value,
        desc = document.getElementById('deckDescription').value;
    if (id) {
        const d = appData.decks.find(x => x.id === id);
        if (d) {
            d.name = name;
            d.description = desc
        }
    } else appData.decks.push({
        id: Date.now().toString(),
        name,
        description: desc,
        createdAt: Date.now()
    });
    saveData();
    closeModal('deckModal');
    document.getElementById('deckForm').reset();
    document.getElementById('deckId').value = ''
}

function editDeck(id) {
    const d = appData.decks.find(x => x.id === id);
    if (d) {
        document.getElementById('deckId').value = d.id;
        document.getElementById('deckName').value = d.name;
        document.getElementById('deckDescription').value = d.description || '';
        document.getElementById('deckModalTitle').textContent = 'Edit Deck';
        showModal('deckModal')
    }
}

function deleteDeck(id) {
    if (confirm('Delete deck and cards?')) {
        appData.decks = appData.decks.filter(d => d.id !== id);
        appData.cards = appData.cards.filter(c => c.deckId !== id);
        saveData()
    }
}

function saveCard(e) {
    e.preventDefault();
    const id = document.getElementById('cardId').value,
        deckId = document.getElementById('cardDeckId').value,
        front = document.getElementById('cardFrontInput').value,
        back = document.getElementById('cardBackInput').value,
        ex = document.getElementById('cardExampleInput').value;
    if (id) {
        const c = appData.cards.find(x => x.id === id);
        if (c) {
            c.front = front;
            c.back = back;
            c.example = ex
        }
    } else appData.cards.push({
        id: Date.now().toString(),
        deckId,
        front,
        back,
        example: ex,
        interval: 0,
        easeFactor: 2.5,
        reviewCount: 0,
        lastReview: null
    });
    saveData();
    closeModal('cardModal');
    document.getElementById('cardForm').reset();
    document.getElementById('cardId').value = '';
    document.getElementById('cardDeckId').value = ''
}

function showCardModal(deckId) {
    document.getElementById('cardDeckId').value = deckId;
    document.getElementById('cardModalTitle').textContent = 'New Card';
    showModal('cardModal')
}

function exportData() {
    const b = new Blob([JSON.stringify(appData, null, 2)], {
            type: 'application/json'
        }),
        u = URL.createObjectURL(b),
        a = document.createElement('a');
    a.href = u;
    a.download = 'linguaflash-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(u)
}

function importData(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
        try {
            const i = JSON.parse(ev.target.result);
            if (confirm('Replace all data?')) {
                appData = i;
                saveData();
                alert('Imported!')
            }
        } catch (err) {
            alert('Invalid file')
        }
    };
    r.readAsText(f)
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    const n = document.querySelector('.nav-btn[onclick=\"showView(\\'
        '+id+'\\
        ')\"]');
    if (n) n.classList.add('active');
    if (id === 'decks') renderDecks()
}

function showModal(id) {
    document.getElementById(id).classList.add('active')
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active')
}

function updateUI() {
    document.getElementById('playerNameDisplay').textContent = appData.player.name;
    document.getElementById('playerLevel').textContent = appData.player.level;
    document.getElementById('currentXP').textContent = appData.player.xp;
    document.getElementById('xpToNext').textContent = appData.player.xpToNext;
    document.getElementById('xpBarFill').style.width = (appData.player.xp / appData.player.xpToNext * 100) + '%';
    document.getElementById('statMastered').textContent = appData.player.masteredCards;
    document.getElementById('statStreak').textContent = appData.player.streak;
    document.getElementById('statReviews').textContent = appData.player.totalReviews;
    const ini = appData.player.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('playerAvatar').textContent = ini || '🎓';
    const now = Date.now(),
        due = appData.cards.filter(c => now >= (c.lastReview || 0) + ((c.interval || 0) * 864e5)).length;
    document.getElementById('dueToday').textContent = due;
    document.getElementById('totalReviewed').textContent = appData.player.totalReviews;
    document.getElementById('currentStreak').textContent = appData.player.streak;
    document.getElementById('totalCards').textContent = appData.cards.length
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML
}
let confettiActive = false,
    confettiParticles = [];

function startConfetti() {
    confettiActive = true;
    confettiParticles = [];
    const cv = document.getElementById('confetti-canvas'),
        ctx = cv.getContext('2d');
    cv.width = innerWidth;
    cv.height = innerHeight;
    const colors = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#ef4444', '#fbbf24'];
    for (let i = 0; i < 150; i++) confettiParticles.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height - cv.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 5 + 2,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        rs: Math.random() * 10 - 5
    });
    animateConfetti(ctx, cv);
    setTimeout(() => {
        confettiActive = false;
        ctx.clearRect(0, 0, cv.width, cv.height)
    }, 5000)
}

function animateConfetti(ctx, cv) {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rs;
        if (p.y > cv.height) {
            p.y = -20;
            p.x = Math.random() * cv.width
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore()
    });
    requestAnimationFrame(() => animateConfetti(ctx, cv))
}
window.addEventListener('resize', () => {
    const cv = document.getElementById('confetti-canvas');
    cv.width = innerWidth;
    cv.height = innerHeight
});
init();