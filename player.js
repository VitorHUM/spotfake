const audio = document.getElementById('audio');
const cover = document.getElementById('cover');
const playPauseBtn = document.getElementById('play-pause');
const playPauseImg = playPauseBtn.querySelector('img');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const shuffleImg = shuffleBtn.querySelector('img');
const repeatBtn = document.getElementById('repeat');
const repeatImg = repeatBtn.querySelector('img');
const musicTitle = document.getElementById('music-title');
const artistName = document.getElementById('artist-name');
const progressBar = document.getElementById('progress-bar');
const volumeBtn = document.getElementById('volume');
const volumeImg = volumeBtn.querySelector('img');
const volumeSlider = document.getElementById('volume-slider');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');
const queueList = document.getElementById('queue-list');

const musicFiles = [
  './musicas/Bring Me The Horizon - Parasite Eve.mp3',
  './musicas/Sting - What Could Have Been.mp3',
  './musicas/Neelix - Makeup (Blazy Remix).mp3',
  './musicas/Matuê - A Morte do Autotune.mp3',
  './musicas/Pop Smoke - Dior.mp3',
];

let musicIndex = 0;
let isShuffle = false;
let isRepeat = false;
let lastPlayedIndexes = [];

function loadMusic(index) {
  const music = queue[index];
  if (!music) {
    return;
  }

  audio.src = music.musicPath;
  cover.src = music.coverPath;
  musicTitle.textContent = music.title;
  artistName.textContent = music.artist;

  highlightCurrentMusic(index);
}

function getRandomIndex() {
  let availableIndexes = queue
    .map((_, i) => i)
    .filter((i) => i !== musicIndex && !lastPlayedIndexes.includes(i));

  if (availableIndexes.length === 0) {
    lastPlayedIndexes = [];
    availableIndexes = queue.map((_, i) => i).filter((i) => i !== musicIndex);
  }

  const randomIndex =
    availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  lastPlayedIndexes.push(randomIndex);

  if (lastPlayedIndexes.length > queue.length / 2) {
    lastPlayedIndexes.shift();
  }

  return randomIndex;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.title = 'Pause';
    playPauseImg.src = './icons/pause.svg';
    playPauseImg.alt = 'Pause';
  } else {
    audio.pause();
    playPauseBtn.title = 'Play';
    playPauseImg.src = './icons/play.svg';
    playPauseImg.alt = 'Play';
  }
});

prevBtn.addEventListener('click', () => {
  musicIndex = isShuffle
    ? getRandomIndex()
    : (musicIndex - 1 + musicFiles.length) % musicFiles.length;

  loadMusic(musicIndex);
  audio.play();
  playPauseBtn.title = 'Pause';
  playPauseImg.src = './icons/pause.svg';
  playPauseImg.alt = 'Pause';
});

nextBtn.addEventListener('click', () => {
  musicIndex = isShuffle
    ? getRandomIndex()
    : (musicIndex + 1) % musicFiles.length;

  loadMusic(musicIndex);
  audio.play();
  playPauseBtn.title = 'Pause';
  playPauseImg.src = './icons/pause.svg';
  playPauseImg.alt = 'Pause';
});

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleImg.classList.toggle('active');
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatImg.classList.toggle('active');
  audio.loop = isRepeat;
});

volumeBtn.addEventListener('click', () => {
  if (audio.volume === 0) {
    volumeBtn.title = 'Mute';
    audio.volume = volumeSlider.value
      ? volumeSlider.value / volumeSlider.max
      : 0.5;
  } else {
    volumeBtn.title = 'Unmute';
    audio.volume = 0;
  }
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value / volumeSlider.max;
});

audio.addEventListener('volumechange', () => {
  if (audio.volume === 0) {
    volumeBtn.title = 'Unmute';
    volumeImg.src = './icons/volume-0.svg';
  } else if (audio.volume > 0 && audio.volume <= 0.4) {
    volumeBtn.title = 'Mute';
    volumeImg.src = './icons/volume-1.svg';
  } else {
    volumeBtn.title = 'Mute';
    volumeImg.src = './icons/volume-2.svg';
  }

  volumeSlider.style.background = `linear-gradient(to right, #fff ${
    audio.volume * 100
  }%, #535353 ${audio.volume * 100}%)`;
});

audio.addEventListener('timeupdate', () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration || 0; // Evita NaN

  const progress = duration ? (currentTime / duration) * 100 : 0;
  progressBar.value = progress;

  currentTimeDisplay.textContent = formatTime(currentTime);
  totalTimeDisplay.textContent = formatTime(duration);

  progressBar.style.background = `linear-gradient(to right, #fff ${progress}%, #535353 ${progress}%)`;
});

audio.addEventListener('ended', () => {
  if (isShuffle) {
    musicIndex = getRandomIndex();
  } else {
    musicIndex = (musicIndex + 1) % musicFiles.length;
  }

  loadMusic(musicIndex);
  audio.play();
  playPauseBtn.title = 'Pause';
  playPauseImg.src = './icons/pause.svg';
  playPauseImg.alt = 'Pause';
});

progressBar.addEventListener('input', () => {
  const newTime = (progressBar.value / 100) * audio.duration;
  audio.currentTime = newTime;
});

const queue = musicFiles.map((musicPath, index) => {
  const fileName = musicPath.split('/').pop().split('.')[0];
  const coverPath = `./capas/${fileName}.jpeg`;
  const [artist, title] = fileName.split(' - ');

  return {
    index,
    coverPath,
    musicPath,
    title: title || 'Título desconhecido',
    artist: artist || 'Artista desconhecido',
  };
});

function getMusicDuration(musicPath, callback) {
  const tempAudio = new Audio();
  tempAudio.src = musicPath;

  tempAudio.addEventListener('loadedmetadata', () => {
    const minutes = Math.floor(tempAudio.duration / 60);
    const seconds = Math.floor(tempAudio.duration % 60)
      .toString()
      .padStart(2, '0');
    callback(`${minutes}:${seconds}`);
  });
}

function highlightCurrentMusic(currentIndex) {
  const queueItems = document.querySelectorAll('#queue-list li');

  queueItems.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add('playing');
    } else {
      item.classList.remove('playing');
    }
  });
}

function updatePlayPauseButtons() {
  document.querySelectorAll('.play-btn-hover').forEach((button, i) => {
    const img = button.querySelector('.play-pause-hover');

    if (i === musicIndex && !audio.paused) {
      img.src = './icons/pause-hover.svg';
      img.alt = 'Pause';
      button.title = 'Pause';
    } else {
      img.src = './icons/play-hover.svg';
      img.alt = 'Play';
      button.title = 'Play';
    }
  });
}

audio.addEventListener('pause', updatePlayPauseButtons);
audio.addEventListener('play', updatePlayPauseButtons);

function updateQueueUI() {
  queueList.innerHTML = '';

  queue.forEach((music, index) => {
    const divContainer = document.createElement('div');
    divContainer.classList.add('queue-music-container');

    const li = document.createElement('li');

    const musicContainer = document.createElement('div');
    musicContainer.classList.add('music-container');

    const musicIndexNumber = document.createElement('span');
    musicIndexNumber.classList.add('music-index');
    musicIndexNumber.textContent = `${index + 1}`;

    const playButtonHover = document.createElement('button');
    playButtonHover.classList.add('play-btn-hover');
    playButtonHover.innerHTML =
      '<img class="play-pause-hover" src="./icons/play-hover.svg" alt="Play" />';
    playButtonHover.style.display = 'none';

    playButtonHover.addEventListener('click', () => {
      let newMusicIndex = index;

      if (musicIndex === newMusicIndex) {
        if (audio.paused) {
          audio.play();
          playPauseBtn.title = 'Pause';
          playPauseImg.src = './icons/pause.svg';
          playPauseImg.alt = 'Pause';
        } else {
          audio.pause();
          playPauseBtn.title = 'Play';
          playPauseImg.src = './icons/play.svg';
          playPauseImg.alt = 'Play';
        }
      } else {
        musicIndex = newMusicIndex;
        loadMusic(newMusicIndex);
        audio.play();
      }

      updatePlayPauseButtons();
    });

    const musicRow = document.createElement('div');
    musicRow.classList.add('music-row');

    const musicCover = document.createElement('img');
    musicCover.classList.add('music-cover');
    musicCover.src = music.coverPath;

    const infosContainer = document.createElement('div');
    infosContainer.classList.add('infos-container');

    const musicTitle = document.createElement('span');
    musicTitle.classList.add('music-title');
    musicTitle.textContent = `${music.title}`;

    const musicArtist = document.createElement('span');
    musicArtist.classList.add('music-artist');
    musicArtist.textContent = `${music.artist}`;

    const musicDuration = document.createElement('span');
    musicDuration.classList.add('music-duration');
    musicDuration.textContent = '0:00';

    li.addEventListener('mouseenter', () => {
      musicIndexNumber.style.display = 'none';
      playButtonHover.style.display = 'block';
    });

    li.addEventListener('mouseleave', () => {
      musicIndexNumber.style.display = 'block';
      playButtonHover.style.display = 'none';
    });

    li.appendChild(musicContainer);
    musicContainer.appendChild(musicIndexNumber);
    musicContainer.appendChild(playButtonHover);
    musicContainer.appendChild(musicRow);
    musicRow.appendChild(musicCover);
    musicRow.appendChild(infosContainer);
    infosContainer.appendChild(musicTitle);
    infosContainer.appendChild(musicArtist);
    li.appendChild(musicDuration);
    divContainer.appendChild(li);
    queueList.appendChild(divContainer);

    getMusicDuration(music.musicPath, (duration) => {
      musicDuration.textContent = duration;
    });
  });
}

audio.volume = 0.5;
volumeSlider.value = audio.volume;

updateQueueUI();
loadMusic(musicIndex);
