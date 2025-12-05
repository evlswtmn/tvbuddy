const DEFAULT_TEMPLATE = {
  workflow: 'zendesk_ticket_close',
  rules: {
    requiredFields: [
      { selector: "input[name='subject']", label: 'Subject' },
      { selector: "textarea[name='description']", label: 'Description' }
    ],
    allowedValues: [
      { selector: "select[name='status']", label: 'Status', allowed: ['solved', 'closed'] }
    ],
    regexChecks: [
      {
        selector: "textarea[name='description']",
        label: 'Root cause mentioned',
        pattern: 'root cause',
        flags: 'i',
        message: 'Narrative should mention the root cause explicitly.'
      }
    ],
    llmChecks: [
      {
        selector: "textarea[name='description']",
        label: 'Narrative quality',
        expectation: 'Summary mentions customer impact, root cause, and remediation.',
        hint: 'Add a short paragraph outlining impact, root cause, and remediation.'
      }
    ]
  }
};

function domainKey() {
  const input = document.getElementById('domain');
  return input.value.trim() || 'zendesk.com';
}

function loadDomainConfig() {
  const key = domainKey();
  chrome.storage.sync.get([key], (result) => {
    const stored = result[key] || {};
    document.getElementById('plan').value = stored.license?.plan || 'free';
    document.getElementById('licenseKey').value = stored.license?.key || '';
    document.getElementById('hardBlock').checked = stored.teamFeatures?.hardBlock ?? true;
    document.getElementById('analytics').checked = stored.teamFeatures?.analytics ?? true;
    const sop = stored.rules ? { workflow: stored.workflow || 'zendesk_ticket_close', rules: stored.rules } : DEFAULT_TEMPLATE;
    document.getElementById('sopJson').value = JSON.stringify(sop, null, 2);
    setStatus(`Loaded config for ${key}.`);
  });
}

function setStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#f87171' : '#9ca3af';
}

function saveConfig() {
  const key = domainKey();
  let sop;
  try {
    sop = JSON.parse(document.getElementById('sopJson').value || '{}');
  } catch (error) {
    setStatus('Invalid JSON. Please fix and try again.', true);
    return;
  }
  const payload = {
    domain: key,
    workflow: sop.workflow || 'zendesk_ticket_close',
    rules: sop.rules || DEFAULT_TEMPLATE.rules,
    license: {
      plan: document.getElementById('plan').value,
      pro: document.getElementById('plan').value === 'pro',
      key: document.getElementById('licenseKey').value
    },
    teamFeatures: {
      hardBlock: document.getElementById('hardBlock').checked,
      analytics: document.getElementById('analytics').checked
    }
  };
  chrome.storage.sync.set({ [key]: payload }, () => {
    setStatus(`Saved config for ${key}.`);
  });
}

function insertTemplate() {
  document.getElementById('sopJson').value = JSON.stringify(DEFAULT_TEMPLATE, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('load').addEventListener('click', loadDomainConfig);
  document.getElementById('save').addEventListener('click', saveConfig);
  document.getElementById('template').addEventListener('click', insertTemplate);
  loadDomainConfig();
});
