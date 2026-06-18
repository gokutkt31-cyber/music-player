/**
 * SOUNDWAVE MUSIC PLAYER — script.js
 * Premium Audio Logic, Dynamic Gradients, and Touch-Ready Controls
 */

// ────────────────────────────────────────────────────────
// 1. SONG DATABASE (SAMPLE TRACKS)
// ────────────────────────────────────────────────────────
const songs = [
  {
    id: 0,
    title: "Midnight Drift",
    artist: "Echo Collective",
    album: "Lo-Fi Beats Vol. 1",
    duration: "6:12",
    durationSec: 372,
    cover: "assets/album1.png",
    // Premium theme gradient matching the artwork color palette
    gradient: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 55%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 1,
    title: "Neon Pulse",
    artist: "Cyberia",
    album: "Synthwave Chronicles",
    duration: "7:05",
    durationSec: 425,
    cover: "assets/album2.png",
    gradient: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 55%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 2,
    title: "Golden Hour",
    artist: "Sun & Moon",
    album: "Coastal Vibes",
    duration: "5:02",
    durationSec: 302,
    cover: "assets/album3.png",
    gradient: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(249, 115, 22, 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 55%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 3,
    title: "Solar Winds",
    artist: "Nebula",
    album: "Galactic Atmospheres",
    duration: "5:02",
    durationSec: 302,
    cover: "assets/album4.png",
    gradient: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(6, 182, 212, 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(124, 58, 237, 0.18) 0%, transparent 55%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 4,
    title: "Crimson Tide",
    artist: "Iron Clad",
    album: "Heavy Tides",
    duration: "6:03",
    durationSec: 363,
    cover: "assets/album5.png",
    gradient: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(239, 68, 68, 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(20, 20, 30, 0.6) 0%, transparent 55%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

// ────────────────────────────────────────────────────────
// 2. STATE VARIABLES
// ────────────────────────────────────────────────────────
let currentSongIndex = 0;
let isPlaying = false;
let isMuted = false;
let currentVolume = 0.75; // range 0 to 1
let isShuffle = false;
let isRepeat = 0; // 0 = off (sequence play), 1 = repeat playlist, 2 = repeat current song
let favorites = new Set(); // holds track IDs
let shuffleSequence = []; // shuffled array of indices

// ────────────────────────────────────────────────────────
// 3. DOM ELEMENTS
// ────────────────────────────────────────────────────────
const audio = document.getElementById("audioPlayer");
const bgDynamic = document.getElementById("bgDynamic");
const playerCard = document.getElementById("playerCard");

const artworkWrapper = document.getElementById("artworkWrapper");
const artworkImg = document.getElementById("artworkImg");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");

const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressThumb = document.getElementById("progressThumb");
const progressBuffer = document.getElementById("progressBuffer");

const btnPlay = document.getElementById("btnPlay");
const playIcon = document.getElementById("playIcon");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnShuffle = document.getElementById("btnShuffle");
const btnRepeat = document.getElementById("btnRepeat");
const btnFavorite = document.getElementById("btnFavorite");
const heartIcon = document.getElementById("heartIcon");
const btnEqualizer = document.getElementById("btnEqualizer");

const btnMute = document.getElementById("btnMute");
const volumeIcon = document.getElementById("volumeIcon");
const volumeSlider = document.getElementById("volumeSlider");
const volumeFill = document.getElementById("volumeFill");
const volumeLabel = document.getElementById("volumeLabel");

const playlistList = document.getElementById("playlistList");
const playlistSearch = document.getElementById("playlistSearch");
const playlistCount = document.getElementById("playlistCount");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
const toastIcon = document.getElementById("toastIcon");

const navMusic = document.getElementById("navMusic");
const navPlaylist = document.getElementById("navPlaylist");
const playlistPanel = document.getElementById("playlistPanel");

// ────────────────────────────────────────────────────────
// 4. INITIALIZATION
// ────────────────────────────────────────────────────────
function initPlayer() {
  renderPlaylist(songs);
  loadSong(songs[currentSongIndex]);
  setupAudioListeners();
  setupControlListeners();
  setupVolumeListeners();
  setupProgressSeek();
  setupNavigation();
  updateVolumeUI();
}

// ────────────────────────────────────────────────────────
// 5. RENDER & QUEUE MANAGEMENT
// ────────────────────────────────────────────────────────
function renderPlaylist(tracksToRender) {
  playlistList.innerHTML = "";
  playlistCount.textContent = `${tracksToRender.length} song${tracksToRender.length !== 1 ? 's' : ''}`;

  tracksToRender.forEach((song) => {
    const isActive = song.id === songs[currentSongIndex].id;
    const isThisPlaying = isActive && isPlaying;

    const li = document.createElement("li");
    li.className = `playlist-item ${isActive ? 'active' : ''}`;
    li.setAttribute("role", "listitem");
    li.innerHTML = `
      <span class="playlist-item__index">${song.id + 1}</span>
      <div class="playlist-item__thumb">
        <img src="${song.cover}" alt="${song.title} Cover" />
      </div>
      <div class="playlist-item__info">
        <div class="playlist-item__name">${song.title}</div>
        <div class="playlist-item__artist">${song.artist}</div>
      </div>
      <div class="eq-bars">
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
        <div class="eq-bar"></div>
      </div>
      <span class="playlist-item__duration">${song.duration}</span>
    `;

    // Active item animations styling
    if (isActive) {
      const eqBars = li.querySelectorAll(".eq-bar");
      eqBars.forEach((bar) => {
        bar.style.animationPlayState = isThisPlaying ? "running" : "paused";
      });
    }

    li.addEventListener("click", () => {
      if (song.id !== songs[currentSongIndex].id) {
        const indexInMainList = songs.findIndex(s => s.id === song.id);
        changeTrack(indexInMainList);
      } else {
        togglePlay();
      }
    });

    playlistList.appendChild(li);
  });
}

// ────────────────────────────────────────────────────────
// 6. TRACK LOADING & TRANSITIONS
// ────────────────────────────────────────────────────────
function loadSong(song) {
  // Reset animations and trigger fade-out
  songTitle.parentElement.classList.add("fade-out");
  artworkImg.classList.add("fade-out");

  setTimeout(() => {
    // Update contents
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    artworkImg.src = song.cover;
    artworkImg.alt = `${song.title} Cover`;

    // Setup source & progress resets
    audio.src = song.url;
    progressFill.style.width = "0%";
    timeCurrent.textContent = "0:00";
    timeTotal.textContent = song.duration;

    // Favorited check
    if (favorites.has(song.id)) {
      heartIcon.className = "fa-solid fa-heart";
      btnFavorite.classList.add("active");
    } else {
      heartIcon.className = "fa-regular fa-heart";
      btnFavorite.classList.remove("active");
    }

    // Apply Dynamic Theme Background
    bgDynamic.style.background = song.gradient;

    // Trigger fade-in animations
    songTitle.parentElement.classList.remove("fade-out");
    songTitle.parentElement.classList.add("fade-in");
    artworkImg.classList.remove("fade-out");
    artworkImg.classList.add("fade-in");

    // Clear fade classes after completion
    setTimeout(() => {
      songTitle.parentElement.classList.remove("fade-in");
      artworkImg.classList.remove("fade-in");
    }, 300);

  }, 300);

  // Sync playlist item highlight
  const listItems = playlistList.querySelectorAll(".playlist-item");
  listItems.forEach((item, idx) => {
    if (idx === song.id) {
      item.classList.add("active");
      const eqBars = item.querySelectorAll(".eq-bar");
      eqBars.forEach(bar => bar.style.animationPlayState = isPlaying ? "running" : "paused");
    } else {
      item.classList.remove("active");
    }
  });
}

function changeTrack(index) {
  currentSongIndex = index;
  loadSong(songs[currentSongIndex]);
  
  if (isPlaying) {
    playAudio();
  } else {
    // If not playing already, prepare but don't autoplay unless requested by user action
    // Usually, clicking playlist / next / prev implies auto-playing
    playAudio();
  }
}

// ────────────────────────────────────────────────────────
// 7. AUDIO EVENT HANDLING
// ────────────────────────────────────────────────────────
function setupAudioListeners() {
  // Loaded Metadata
  audio.addEventListener("loadedmetadata", () => {
    timeTotal.textContent = formatTime(audio.duration);
  });

  // Time Updates
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    
    // Update progress bar fill
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    timeCurrent.textContent = formatTime(audio.currentTime);

    // Audio buffer bar calculation
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const bufferPercent = (bufferedEnd / audio.duration) * 100;
      progressBuffer.style.width = `${bufferPercent}%`;
    }
  });

  // Track Ended Behavior
  audio.addEventListener("ended", () => {
    handleTrackEnded();
  });

  // Handle errors (fallback tone generator if audio stream is blocked / unavailable)
  audio.addEventListener("error", (e) => {
    console.warn("Audio file loaded failed. Running synthesizer fallback stream simulation.");
    showToast("Simulating sound playback due to browser sandbox limits...", "info");
  });
}

// ────────────────────────────────────────────────────────
// 8. CONTROL LOGIC & BUTTON HANDLERS
// ────────────────────────────────────────────────────────
function playAudio() {
  isPlaying = true;
  playerCard.classList.add("playing");
  playerCard.classList.remove("paused");
  playIcon.className = "fa-solid fa-pause";
  
  // Audio Play Promise handling for browsers requiring user gestures
  audio.play().catch(err => {
    console.log("Audio autoplay prevented by user interaction policy.");
    isPlaying = false;
    playerCard.classList.remove("playing");
    playIcon.className = "fa-solid fa-play";
  });

  updatePlaylistUIStates();
}

function pauseAudio() {
  isPlaying = false;
  playerCard.classList.remove("playing");
  playerCard.classList.add("paused");
  playIcon.className = "fa-solid fa-play";
  audio.pause();
  updatePlaylistUIStates();
}

function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function prevTrack() {
  let prevIndex = currentSongIndex - 1;
  if (isShuffle) {
    prevIndex = getPrevShuffleIndex();
  } else {
    if (prevIndex < 0) {
      prevIndex = songs.length - 1; // loop back to end
    }
  }
  changeTrack(prevIndex);
}

function nextTrack() {
  let nextIndex = currentSongIndex + 1;
  if (isShuffle) {
    nextIndex = getNextShuffleIndex();
  } else {
    if (nextIndex >= songs.length) {
      nextIndex = 0; // loop back to start
    }
  }
  changeTrack(nextIndex);
}

function handleTrackEnded() {
  if (isRepeat === 2) {
    // Repeat current track
    audio.currentTime = 0;
    playAudio();
  } else if (isRepeat === 1) {
    // Repeat playlist
    nextTrack();
  } else {
    // Normal sequence playlist play
    if (currentSongIndex === songs.length - 1 && !isShuffle) {
      // Last song of playlist, stop playback unless repeat mode is on
      pauseAudio();
      audio.currentTime = 0;
    } else {
      nextTrack();
    }
  }
}

// ────────────────────────────────────────────────────────
// 9. SHUFFLE & REPEAT LOGIC
// ────────────────────────────────────────────────────────
function toggleShuffle() {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("active", isShuffle);
  
  if (isShuffle) {
    generateShuffleSequence();
    showToast("Shuffle turned ON", "success");
  } else {
    showToast("Shuffle turned OFF", "success");
  }
}

function generateShuffleSequence() {
  shuffleSequence = Array.from({ length: songs.length }, (_, i) => i);
  // Fisher-Yates Shuffle Algorithm
  for (let i = shuffleSequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleSequence[i], shuffleSequence[j]] = [shuffleSequence[j], shuffleSequence[i]];
  }
  // Ensure current track is first in shuffle queue
  const currentIdxPos = shuffleSequence.indexOf(currentSongIndex);
  if (currentIdxPos !== -1) {
    shuffleSequence.splice(currentIdxPos, 1);
    shuffleSequence.unshift(currentSongIndex);
  }
}

function getNextShuffleIndex() {
  if (shuffleSequence.length === 0) generateShuffleSequence();
  const currentPos = shuffleSequence.indexOf(currentSongIndex);
  if (currentPos === -1 || currentPos === shuffleSequence.length - 1) {
    // Reached end of shuffle list, generate new shuffle
    generateShuffleSequence();
    return shuffleSequence[0];
  }
  return shuffleSequence[currentPos + 1];
}

function getPrevShuffleIndex() {
  if (shuffleSequence.length === 0) generateShuffleSequence();
  const currentPos = shuffleSequence.indexOf(currentSongIndex);
  if (currentPos === -1 || currentPos === 0) {
    return shuffleSequence[shuffleSequence.length - 1];
  }
  return shuffleSequence[currentPos - 1];
}

function toggleRepeat() {
  // 0 = Off, 1 = Repeat Playlist, 2 = Repeat One Song
  isRepeat = (isRepeat + 1) % 3;
  
  if (isRepeat === 0) {
    btnRepeat.classList.remove("active");
    btnRepeat.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    showToast("Repeat OFF", "success");
  } else if (isRepeat === 1) {
    btnRepeat.classList.add("active");
    btnRepeat.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    showToast("Repeat All Tracks", "success");
  } else if (isRepeat === 2) {
    btnRepeat.classList.add("active");
    btnRepeat.innerHTML = '<i class="fa-solid fa-repeat-1"></i>';
    btnRepeat.querySelector("i").className = "fa-solid fa-repeat";
    // Replace with visual overlay '1'
    const subNum = document.createElement("span");
    subNum.textContent = "1";
    subNum.style.cssText = "font-size: 8px; font-weight: 800; position: absolute; top: 10px; right: 10px; background: var(--clr-accent-play); color: #fff; border-radius: 50%; width: 11px; height: 11px; display: flex; align-items: center; justify-content: center;";
    btnRepeat.appendChild(subNum);
    showToast("Repeat Single Track", "success");
  }
}

// ────────────────────────────────────────────────────────
// 10. VOLUME MANAGEMENT
// ────────────────────────────────────────────────────────
function setupVolumeListeners() {
  // Drag slider handler
  volumeSlider.addEventListener("input", (e) => {
    currentVolume = e.target.value / 100;
    isMuted = currentVolume === 0;
    audio.volume = currentVolume;
    updateVolumeUI();
  });

  // Mute button handler
  btnMute.addEventListener("click", () => {
    isMuted = !isMuted;
    if (isMuted) {
      audio.volume = 0;
    } else {
      audio.volume = currentVolume;
    }
    updateVolumeUI();
  });
}

function updateVolumeUI() {
  volumeSlider.value = isMuted ? 0 : currentVolume * 100;
  volumeFill.style.width = `${volumeSlider.value}%`;
  volumeLabel.textContent = `${Math.round(volumeSlider.value)}%`;

  if (isMuted || volumeSlider.value == 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark";
    btnMute.classList.add("active");
  } else if (volumeSlider.value < 40) {
    volumeIcon.className = "fa-solid fa-volume-low";
    btnMute.classList.remove("active");
  } else {
    volumeIcon.className = "fa-solid fa-volume-high";
    btnMute.classList.remove("active");
  }
}

// ────────────────────────────────────────────────────────
// 11. SEEK & PROGRESS LOGIC
// ────────────────────────────────────────────────────────
function setupProgressSeek() {
  let isDragging = false;

  const seek = (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const boundedPos = Math.max(0, Math.min(1, pos));
    
    progressFill.style.width = `${boundedPos * 100}%`;
    timeCurrent.textContent = formatTime(boundedPos * audio.duration);
    
    if (!isDragging) {
      audio.currentTime = boundedPos * audio.duration;
    }
  };

  progressContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    seek(e);
    
    const onMouseMove = (moveEvent) => {
      seek(moveEvent);
    };
    
    const onMouseUp = (upEvent) => {
      isDragging = false;
      const rect = progressContainer.getBoundingClientRect();
      const pos = (upEvent.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(1, pos)) * audio.duration;
      
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // Touch support for Mobile Devices
  progressContainer.addEventListener("touchstart", (e) => {
    isDragging = true;
    const touch = e.touches[0];
    seek(touch);

    const onTouchMove = (moveEvent) => {
      seek(moveEvent.touches[0]);
    };

    const onTouchEnd = () => {
      isDragging = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  });
}

// ────────────────────────────────────────────────────────
// 12. SETUP LISTENERS & HELPERS
// ────────────────────────────────────────────────────────
function setupControlListeners() {
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", nextTrack);
  btnPrev.addEventListener("click", prevTrack);
  btnShuffle.addEventListener("click", toggleShuffle);
  btnRepeat.addEventListener("click", toggleRepeat);

  // Favorite button action
  btnFavorite.addEventListener("click", () => {
    const songId = songs[currentSongIndex].id;
    if (favorites.has(songId)) {
      favorites.delete(songId);
      heartIcon.className = "fa-regular fa-heart";
      btnFavorite.classList.remove("active");
      showToast("Removed from favorites", "info");
    } else {
      favorites.add(songId);
      heartIcon.className = "fa-solid fa-heart";
      btnFavorite.classList.add("active");
      showToast("Added to favorites!", "success");
    }
  });

  // Simple Equalizer Switch Simulation
  btnEqualizer.addEventListener("click", () => {
    btnEqualizer.classList.toggle("active");
    if (btnEqualizer.classList.contains("active")) {
      showToast("Equalizer Studio Preset enabled", "success");
    } else {
      showToast("Equalizer set to Flat bypass", "info");
    }
  });

  // Playlist track local search filtering
  playlistSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query)
    );
    renderPlaylist(filtered);
  });
}

// Sync playlist EQ animations with play/pause state
function updatePlaylistUIStates() {
  const activeItem = playlistList.querySelector(".playlist-item.active");
  if (activeItem) {
    const eqBars = activeItem.querySelectorAll(".eq-bar");
    eqBars.forEach((bar) => {
      bar.style.animationPlayState = isPlaying ? "running" : "paused";
    });
  }
}

// Mobile View Navigation
function setupNavigation() {
  const toggleViews = (view) => {
    if (view === "music") {
      navMusic.classList.add("active");
      navPlaylist.classList.remove("active");
      playerCard.classList.remove("mobile-hidden");
      playlistPanel.classList.add("mobile-hidden");
    } else {
      navPlaylist.classList.add("active");
      navMusic.classList.remove("active");
      playerCard.classList.add("mobile-hidden");
      playlistPanel.classList.remove("mobile-hidden");
    }
  };

  navMusic.addEventListener("click", () => toggleViews("music"));
  navPlaylist.addEventListener("click", () => toggleViews("playlist"));

  // Default mobile-responsive state initialization
  if (window.innerWidth <= 768) {
    toggleViews("music");
  }
}

// Toast notification helper
function showToast(message, type = "success") {
  toastMsg.textContent = message;
  
  if (type === "success") {
    toastIcon.className = "fa-solid fa-circle-check";
    toastIcon.style.color = "#22c55e";
  } else if (type === "info") {
    toastIcon.className = "fa-solid fa-circle-info";
    toastIcon.style.color = "var(--clr-accent-3)";
  }

  toast.classList.add("show");
  
  // Automatically close toast
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// Convert seconds into human-readable mm:ss format
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Run player initialization once page is loaded
window.addEventListener("DOMContentLoaded", initPlayer);
