const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

const ayahText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
const normalizedAyah = ayahText
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const ayahWords = normalizedAyah.split(' ');
const ayahContainer = document.getElementById('ayahContainer');
const toggleTextBtn = document.getElementById('toggleTextBtn');
const micBtn = document.getElementById('micBtn');
const speechStatus = document.getElementById('speechStatus');

const sheikhSelect = document.getElementById('sheikhSelect');
const audioPlayer = document.getElementById('audioPlayer');

const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const nameInput = document.getElementById('nameInput');
const surahInput = document.getElementById('surahInput');
const learnedInput = document.getElementById('learnedInput');
const remainingInput = document.getElementById('remainingInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileStatus = document.getElementById('profileStatus');

let recognition;
let isListening = false;
let revealedIndex = 0;

function renderAyah() {
  ayahContainer.innerHTML = '';
  ayahWords.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'ayah-word';
    if (index < revealedIndex) span.classList.add('revealed');
    span.textContent = word;
    ayahContainer.appendChild(span);
  });
}

function revealNextWords(spokenText) {
  const cleanSpoken = spokenText
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSpoken) return;

  const spokenWords = cleanSpoken.split(' ');
  while (
    revealedIndex < ayahWords.length &&
    spokenWords.includes(ayahWords[revealedIndex])
  ) {
    revealedIndex += 1;
  }
  renderAyah();

  if (revealedIndex >= ayahWords.length) {
    speechStatus.textContent = 'МашаАллах! Все слова открыты.';
  }
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    speechStatus.textContent = 'В этом браузере нет поддержки распознавания речи.';
    micBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = '⏹️ Остановить';
    speechStatus.textContent = 'Слушаю... читайте Коран.';
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.textContent = '🎤 Микрофон';
    if (revealedIndex < ayahWords.length) {
      speechStatus.textContent = 'Микрофон выключен.';
    }
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ');

    revealNextWords(transcript);
  };

  recognition.onerror = () => {
    speechStatus.textContent = 'Ошибка микрофона. Проверьте разрешение на доступ.';
  };
}

function setupTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

function setupAudio() {
  sheikhSelect.addEventListener('change', () => {
    const newSource = sheikhSelect.value;
    audioPlayer.src = newSource;
    audioPlayer.play().catch(() => {
      // autoplay может блокироваться браузером
    });
  });
}

function setupQuranControls() {
  toggleTextBtn.addEventListener('click', () => {
    ayahContainer.classList.toggle('hidden-text');
  });

  micBtn.addEventListener('click', () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

function loadProfile() {
  const saved = JSON.parse(localStorage.getItem('quranProfile') || '{}');

  if (saved.avatar) avatarPreview.src = saved.avatar;
  if (saved.name) nameInput.value = saved.name;
  if (saved.surah) surahInput.value = saved.surah;
  if (typeof saved.learned === 'number') learnedInput.value = saved.learned;
  if (typeof saved.remaining === 'number') remainingInput.value = saved.remaining;

  if (saved.name || saved.surah) {
    profileStatus.textContent = `Сохранено: ${saved.name || 'Без имени'}, сура: ${saved.surah || 'не указана'}, выучено ${saved.learned || 0}, осталось ${saved.remaining || 0}.`;
  }
}

function setupProfile() {
  avatarInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  saveProfileBtn.addEventListener('click', () => {
    const profile = {
      avatar: avatarPreview.src,
      name: nameInput.value.trim(),
      surah: surahInput.value.trim(),
      learned: Number(learnedInput.value || 0),
      remaining: Number(remainingInput.value || 0),
    };

    localStorage.setItem('quranProfile', JSON.stringify(profile));
    profileStatus.textContent = `Профиль сохранён. ${profile.name || 'Без имени'}: сура ${profile.surah || 'не указана'}, выучено ${profile.learned}, осталось ${profile.remaining}.`;
  });
}

setupTabs();
renderAyah();
setupSpeechRecognition();
setupQuranControls();
setupAudio();
setupProfile();
loadProfile();
