let timeoutId = null;
let isRunning = false;
let clickCount = 0;
let noButtonCount = 0;
const MAX_NO_BUTTON_ATTEMPTS = 5;

// Default speed profile settings in ms
let speedProfile = 'medium';
const SPEEDS = {
  fast: { min: 400, max: 800 },
  medium: { min: 800, max: 1500 },
  safe: { min: 1500, max: 3000 }
};

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Restore state from storage on script initialization
chrome.storage.local.get(['isRunning', 'clickCount', 'speedProfile'], (res) => {
  if (res.clickCount !== undefined) clickCount = res.clickCount;
  if (res.speedProfile && SPEEDS[res.speedProfile]) speedProfile = res.speedProfile;
  if (res.isRunning) {
    isRunning = true;
    clickNextButton();
  }
});

function simulateHumanClick(element) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + (Math.random() * 8 - 4);
  const y = rect.top + rect.height / 2 + (Math.random() * 8 - 4);

  const commonProps = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    screenX: x + window.screenX,
    screenY: y + window.screenY,
    button: 0,
    buttons: 1,
  };

  element.dispatchEvent(new PointerEvent('pointerdown', { ...commonProps, pointerId: 1, pointerType: 'mouse' }));
  element.dispatchEvent(new MouseEvent('mousedown', commonProps));

  setTimeout(() => {
    element.dispatchEvent(new PointerEvent('pointerup', { ...commonProps, pointerId: 1, pointerType: 'mouse', buttons: 0 }));
    element.dispatchEvent(new MouseEvent('mouseup', { ...commonProps, buttons: 0 }));
    element.dispatchEvent(new MouseEvent('click', { ...commonProps, buttons: 0 }));
  }, getRandomDelay(30, 90));
}

function findEligibleButton() {
  // Check both class-specific buttons and fallback text matchers
  const candidateButtons = Array.from(document.querySelectorAll('button.share-interest, button, a, div[role="button"]'));
  
  for (const btn of candidateButtons) {
    if (btn.dataset.acProcessed === 'true') continue;
    
    const text = (btn.innerText || btn.textContent || '').trim();
    const isShareInterest = btn.classList.contains('share-interest') || text.toLowerCase() === 'share interest';
    const isVisible = btn.offsetWidth > 0 && btn.offsetHeight > 0;
    const isEnabled = !btn.disabled && !btn.classList.contains('applied') && !btn.classList.contains('disabled');

    if (isShareInterest && isVisible && isEnabled) {
      return btn;
    }
  }
  return null;
}

function updateStorageAndBroadcast() {
  chrome.storage.local.set({ isRunning, clickCount });
}

function clickNextButton() {
  if (!isRunning) return;

  const target = findEligibleButton();
  const currentSpeed = SPEEDS[speedProfile] || SPEEDS.medium;

  if (target) {
    noButtonCount = 0;
    target.dataset.acProcessed = 'true';

    // Smooth scroll target button to middle of screen
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      if (!isRunning) return;
      simulateHumanClick(target);
      clickCount++;
      updateStorageAndBroadcast();
    }, getRandomDelay(250, 450));

    const nextDelay = getRandomDelay(currentSpeed.min, currentSpeed.max);
    timeoutId = setTimeout(clickNextButton, nextDelay + 400); // include scroll pause
  } else {
    noButtonCount++;

    if (noButtonCount <= MAX_NO_BUTTON_ATTEMPTS) {
      // Gentle auto-scroll down to trigger lazy loading / infinite scroll of new tuples
      window.scrollBy({ top: 400, behavior: 'smooth' });
      timeoutId = setTimeout(clickNextButton, getRandomDelay(1000, 1800));
    } else {
      // Auto-stop after consecutive unsuccessful attempts
      isRunning = false;
      updateStorageAndBroadcast();
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    if (request.speed && SPEEDS[request.speed]) {
      speedProfile = request.speed;
      chrome.storage.local.set({ speedProfile });
    }
    
    if (!isRunning) {
      isRunning = true;
      noButtonCount = 0;
      updateStorageAndBroadcast();
      clickNextButton();
    }
    sendResponse({ status: 'started', clickCount });
  } else if (request.action === 'stop') {
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    updateStorageAndBroadcast();
    sendResponse({ status: 'stopped', clickCount });
  } else if (request.action === 'reset') {
    clickCount = 0;
    updateStorageAndBroadcast();
    sendResponse({ status: 'reset', clickCount });
  } else if (request.action === 'getStatus') {
    sendResponse({ isRunning, clickCount, speedProfile });
  }
  return true;
});
