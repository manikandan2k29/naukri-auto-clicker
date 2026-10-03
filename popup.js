const clickCountEl = document.getElementById('clickCount');
const statusBadgeEl = document.getElementById('statusBadge');
const statusTextEl = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const speedBtns = document.querySelectorAll('.speed-btn');

let selectedSpeed = 'medium';

// Sync popup with content script / local storage state
async function syncUI() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Load saved speed setting
  chrome.storage.local.get(['speedProfile', 'clickCount', 'isRunning'], (res) => {
    if (res.clickCount !== undefined) clickCountEl.textContent = res.clickCount;
    if (res.speedProfile) {
      selectedSpeed = res.speedProfile;
      updateSpeedButtonsUI(selectedSpeed);
    }
  });

  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      statusTextEl.textContent = 'Off-page';
      statusBadgeEl.classList.remove('active');
      return;
    }

    if (response) {
      updateRunningUI(response.isRunning);
      if (response.clickCount !== undefined) clickCountEl.textContent = response.clickCount;
      if (response.speedProfile) updateSpeedButtonsUI(response.speedProfile);
    }
  });
}

function updateRunningUI(isRunning) {
  if (isRunning) {
    statusTextEl.textContent = 'Active';
    statusBadgeEl.classList.add('active');
    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
  } else {
    statusTextEl.textContent = 'Idle';
    statusBadgeEl.classList.remove('active');
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
  }
}

function updateSpeedButtonsUI(speed) {
  selectedSpeed = speed;
  speedBtns.forEach((btn) => {
    if (btn.dataset.speed === speed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

speedBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const speed = btn.dataset.speed;
    updateSpeedButtonsUI(speed);
    chrome.storage.local.set({ speedProfile: speed });
  });
});

startBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: 'start', speed: selectedSpeed }, (response) => {
    if (chrome.runtime.lastError) {
      statusTextEl.textContent = 'Open Naukri';
    } else if (response) {
      updateRunningUI(true);
      if (response.clickCount !== undefined) clickCountEl.textContent = response.clickCount;
    }
  });
});

stopBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: 'stop' }, (response) => {
    if (!chrome.runtime.lastError && response) {
      updateRunningUI(false);
      if (response.clickCount !== undefined) clickCountEl.textContent = response.clickCount;
    }
  });
});

resetBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.set({ clickCount: 0 });
  clickCountEl.textContent = '0';

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'reset' });
  }
});

// Periodic sync while popup is open to keep live counter moving
setInterval(syncUI, 1000);
syncUI();
