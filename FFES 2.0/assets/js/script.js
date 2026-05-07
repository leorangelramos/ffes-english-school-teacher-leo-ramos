/* ==============================================================
   SCRIPT.JS - ENGINE GENÉRICA DO SISTEMA FFES
   (Animações de Cassino, Combos, XP, Header e Carrossel)
   ============================================================== */

// 1. SETUP DO HEADER E BOTAO VOLTAR AO TOPO
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (header) {
            if (scrollY > 30) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
        
        if (backToTopBtn) {
            if (scrollY > 300) backToTopBtn.style.display = 'block';
            else backToTopBtn.style.display = 'none';
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 2. LÓGICA GENÉRICA DO CARROSSEL DE EXPLICAÇÕES
    const track = document.getElementById('carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('car-prev');
    const nextBtn = document.getElementById('car-next');
    let currentSlide = 0;

    function updateCarousel() {
        if (!track) return;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        if (currentSlide === 0) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }

        if (currentSlide === slides.length - 1) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }

    if(prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) { currentSlide--; updateCarousel(); }
        });
        nextBtn.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) { currentSlide++; updateCarousel(); }
        });
    }
});

// ----------------------------------------------------
// 3. AUDIO API NATIVA (ENGINE ESTILO CASSINO / CAÇA-NÍQUEL)
// ----------------------------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, type, duration, volumeLevel) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(volumeLevel, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// Funções Globais (Atreladas ao window para qualquer arquivo acessar)
window.playCorrectSound = function() {
    playBeep(987.77, 'sine', 0.08, 0.1); 
    setTimeout(() => playBeep(1318.51, 'sine', 0.15, 0.1), 80); 
};

window.playWrongSound = function() {
    playBeep(120, 'sawtooth', 0.15, 0.2);
    setTimeout(() => playBeep(90, 'sawtooth', 0.25, 0.2), 100);
};

window.playCombo5Sound = function() {
    for(let i=0; i<3; i++) {
        setTimeout(() => {
            playBeep(987.77, 'sine', 0.05, 0.1);
            setTimeout(() => playBeep(1318.51, 'sine', 0.1, 0.1), 50);
        }, i * 120);
    }
};

window.playCombo10Sound = function() {
    for(let i=0; i<12; i++) {
        setTimeout(() => {
            playBeep(1000 + Math.random()*500, 'square', 0.05, 0.05); 
        }, i * 70);
    }
    setTimeout(() => playBeep(1567.98, 'sine', 0.4, 0.1), 850); 
};

window.playCombo20Sound = function() {
    for(let i=0; i<5; i++) {
        setTimeout(() => playBeep(600, 'sawtooth', 0.2, 0.08), i * 300);
        setTimeout(() => playBeep(800, 'sawtooth', 0.2, 0.08), (i * 300) + 150);
    }
    for(let i=0; i<35; i++) {
        setTimeout(() => {
            playBeep(1200 + Math.random()*800, 'sine', 0.05, 0.08);
        }, i * 40);
    }
    setTimeout(() => {
        playBeep(523.25, 'square', 0.5, 0.1); 
        playBeep(659.25, 'square', 0.5, 0.1); 
        playBeep(783.99, 'square', 0.5, 0.1); 
        playBeep(1046.50, 'square', 0.8, 0.15); 
    }, 1500);
};

// ----------------------------------------------------
// 4. ENGINE GENÉRICA DE XP E COMBOS
// ----------------------------------------------------
window.globalXP = parseInt(localStorage.getItem('ffes_global_xp')) || 0;
window.currentCombo = 0;

document.addEventListener('DOMContentLoaded', () => {
    const xpGlobalEl = document.getElementById('xp-global');
    if(xpGlobalEl) xpGlobalEl.textContent = window.globalXP;
});

window.updateXPAndCombo = function(points, isCorrect) {
    const quizPanel = document.getElementById('main-quiz-panel');
    const comboCountEl = document.getElementById('combo-count');
    const comboBar = document.getElementById('combo-bar');

    if (isCorrect) {
        window.globalXP += points;
        window.currentCombo++;
        window.playCorrectSound();
        
        if(quizPanel) {
            quizPanel.classList.add('anim-correct');
            setTimeout(() => quizPanel.classList.remove('anim-correct'), 400);
        }

        if (window.currentCombo === 5) {
            window.playCombo5Sound();
            if(quizPanel) {
                quizPanel.classList.add('anim-combo-5');
                setTimeout(() => quizPanel.classList.remove('anim-combo-5'), 600);
            }
            window.globalXP += 50; 
        } else if (window.currentCombo === 10) {
            window.playCombo10Sound();
            if(quizPanel) {
                quizPanel.classList.add('anim-combo-10');
                setTimeout(() => quizPanel.classList.remove('anim-combo-10'), 900);
            }
            window.globalXP += 100; 
        } else if (window.currentCombo >= 20) {
            window.playCombo20Sound();
            if(quizPanel) {
                quizPanel.classList.add('anim-combo-20');
                setTimeout(() => quizPanel.classList.remove('anim-combo-20'), 1500);
            }
            window.globalXP += 500; 
            window.currentCombo = 0; 
        }
        
        localStorage.setItem('ffes_global_xp', window.globalXP);
        const xpGlobalEl = document.getElementById('xp-global');
        if(xpGlobalEl) xpGlobalEl.textContent = window.globalXP;

    } else {
        window.currentCombo = 0;
        window.playWrongSound();
        if(quizPanel) {
            quizPanel.classList.add('anim-wrong');
            setTimeout(() => quizPanel.classList.remove('anim-wrong'), 400);
        }
    }

    if(comboCountEl && comboBar) {
        let comboWidth = (window.currentCombo / 20) * 100;
        if (comboWidth > 100) comboWidth = 100;
        comboCountEl.textContent = window.currentCombo;
        comboBar.style.width = comboWidth + '%';
    }
};

window.resetComboUI = function() {
    window.currentCombo = 0;
    const comboCountEl = document.getElementById('combo-count');
    const comboBar = document.getElementById('combo-bar');
    if(comboCountEl) comboCountEl.textContent = '0';
    if(comboBar) comboBar.style.width = '0%';
};