// RolePilot — Extension Popup Script

const defaultProfile = {
  fullName: 'Candidate',
  email: 'candidate@email.com',
  phone: '555-0199',
  workAuthorized: true
};

// Retrieve stored candidate profile from Chrome storage or fallback
chrome.storage.local.get(['rolepilot_profile'], (res) => {
  const profile = res.rolepilot_profile || defaultProfile;
  document.getElementById('prof-name').textContent = profile.fullName || 'Candidate';
  document.getElementById('prof-email').textContent = profile.email || '—';
  document.getElementById('prof-phone').textContent = profile.phone || '—';
});

document.getElementById('btn-autofill').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const statusEl = document.getElementById('status-msg');
  statusEl.textContent = 'Autofilling fields…';

  chrome.storage.local.get(['rolepilot_profile'], (res) => {
    const profile = res.rolepilot_profile || defaultProfile;

    chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', profile }, (response) => {
      if (chrome.runtime.lastError) {
        // If content script wasn't automatically injected (e.g. non-matching domain), inject it dynamically
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', profile }, (r) => {
            statusEl.textContent = r?.success ? `✓ Autofilled ${r.count || ''} fields!` : 'Fields populated!';
          });
        });
      } else {
        statusEl.textContent = response?.success ? `✓ Autofilled ${response.count || ''} fields!` : 'Fields populated!';
      }
    });
  });
});
