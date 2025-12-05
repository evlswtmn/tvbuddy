const DEFAULT_SOP = {
  domain: 'zendesk.com',
  workflow: 'zendesk_ticket_close',
  rules: {
    requiredFields: [
      { selector: "input[name='subject']", label: 'Subject' },
      { selector: "textarea[name='description']", label: 'Description' }
    ],
    allowedValues: [
      {
        selector: "select[name='status']",
        label: 'Status',
        allowed: ['solved', 'closed']
      }
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
  },
  license: {
    plan: 'free',
    pro: false
  },
  teamFeatures: {
    hardBlock: true,
    analytics: true
  }
};

function getDomainKey() {
  const hostname = window.location.hostname || DEFAULT_SOP.domain;
  const parts = hostname.split('.');
  return parts.slice(-2).join('.');
}

async function loadConfig() {
  const domainKey = getDomainKey();
  return new Promise((resolve) => {
    chrome.storage.sync.get([domainKey], (result) => {
      if (chrome.runtime.lastError) {
        resolve({ ...DEFAULT_SOP, domain: domainKey });
        return;
      }
      const stored = result[domainKey];
      if (stored && typeof stored === 'object') {
        resolve({ ...DEFAULT_SOP, ...stored, domain: domainKey });
      } else {
        resolve({ ...DEFAULT_SOP, domain: domainKey });
      }
    });
  });
}

function findTargetForm() {
  const candidateSelectors = [
    "form[action*='tickets']",
    "form[action*='zendesk']",
    "form[data-workflow='close-ticket']",
    'form'
  ];
  for (const selector of candidateSelectors) {
    const form = document.querySelector(selector);
    if (form) return form;
  }
  return null;
}

function evaluateRequiredFields(form, rules) {
  return rules.requiredFields.map((field) => {
    const element = form.querySelector(field.selector);
    const value = element && 'value' in element ? element.value.trim() : '';
    const passed = Boolean(value);
    const detail = passed
      ? 'Provided'
      : `Required: ${field.label} must be filled.`;
    return { id: `required-${field.label}`, label: field.label, passed, detail, element };
  });
}

function evaluateAllowedValues(form, rules) {
  return rules.allowedValues.map((rule) => {
    const element = form.querySelector(rule.selector);
    const value = element && 'value' in element ? element.value : '';
    const passed = rule.allowed.includes(value);
    const detail = passed
      ? `Allowed value selected: ${value}`
      : `Value must be one of: ${rule.allowed.join(', ')}`;
    return { id: `allowed-${rule.label}`, label: rule.label, passed, detail, element };
  });
}

function evaluateRegexChecks(form, rules) {
  return rules.regexChecks.map((rule) => {
    const element = form.querySelector(rule.selector);
    const value = element && 'value' in element ? element.value : '';
    const regex = new RegExp(rule.pattern, rule.flags || '');
    const passed = regex.test(value);
    const detail = passed ? 'Matches required phrasing.' : rule.message;
    return {
      id: `regex-${rule.label}`,
      label: rule.label,
      passed,
      detail,
      element
    };
  });
}

function fakeLlmClassifier(text, expectation) {
  const tokens = expectation.toLowerCase().split(/[,\.]/).map((t) => t.trim()).filter(Boolean);
  const missing = tokens.filter((token) => !text.toLowerCase().includes(token.split(' ')[0]));
  const passed = missing.length === 0 && text.length > 40;
  const explanation = passed
    ? 'Narrative contains required elements and length.'
    : `Missing narrative elements: ${missing.join(', ') || 'more detail needed'}.`;
  return { passed, explanation };
}

function evaluateLlmChecks(form, rules) {
  return rules.llmChecks.map((rule) => {
    const element = form.querySelector(rule.selector);
    const value = element && 'value' in element ? element.value : '';
    const { passed, explanation } = fakeLlmClassifier(value, rule.expectation);
    const detail = passed ? 'LLM check passed' : explanation || rule.hint;
    return {
      id: `llm-${rule.label}`,
      label: rule.label,
      passed,
      detail,
      element
    };
  });
}

function evaluateSop(form, rules) {
  return [
    ...evaluateRequiredFields(form, rules),
    ...evaluateAllowedValues(form, rules),
    ...evaluateRegexChecks(form, rules),
    ...evaluateLlmChecks(form, rules)
  ];
}

function renderPanel() {
  const panel = document.createElement('div');
  panel.id = 'sop-guard-panel';
  panel.style.position = 'fixed';
  panel.style.right = '16px';
  panel.style.bottom = '16px';
  panel.style.width = '300px';
  panel.style.maxHeight = '50vh';
  panel.style.overflow = 'auto';
  panel.style.background = '#0f172a';
  panel.style.color = '#e2e8f0';
  panel.style.fontSize = '14px';
  panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
  panel.style.borderRadius = '12px';
  panel.style.padding = '12px';
  panel.style.zIndex = '99999';

  const header = document.createElement('div');
  header.textContent = 'Zendesk Close SOP';
  header.style.fontWeight = '700';
  header.style.marginBottom = '8px';
  panel.appendChild(header);

  const list = document.createElement('div');
  list.id = 'sop-guard-list';
  panel.appendChild(list);

  const footer = document.createElement('div');
  footer.id = 'sop-guard-footer';
  footer.style.marginTop = '8px';
  footer.style.fontSize = '12px';
  footer.style.color = '#cbd5e1';
  panel.appendChild(footer);

  document.body.appendChild(panel);
  return { panel, list, footer };
}

function updatePanel(listEl, footerEl, results, plan) {
  listEl.innerHTML = '';
  results.forEach((result) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '6px';
    row.style.gap = '8px';

    const status = document.createElement('span');
    status.textContent = result.passed ? '✅' : '❌';
    status.title = result.detail;

    const label = document.createElement('span');
    label.textContent = result.label;

    const explain = document.createElement('button');
    explain.textContent = 'Explain';
    explain.style.marginLeft = 'auto';
    explain.style.fontSize = '12px';
    explain.style.background = '#1e293b';
    explain.style.color = '#e2e8f0';
    explain.style.border = '1px solid #334155';
    explain.style.borderRadius = '6px';
    explain.style.cursor = 'pointer';
    explain.addEventListener('click', () => {
      const tooltip = document.createElement('div');
      tooltip.textContent = generateExplainTooltip(result);
      tooltip.style.background = '#0b1221';
      tooltip.style.border = '1px solid #334155';
      tooltip.style.padding = '8px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.marginTop = '4px';
      tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
      row.appendChild(tooltip);
      setTimeout(() => tooltip.remove(), 4000);
    });

    row.appendChild(status);
    row.appendChild(label);
    row.appendChild(explain);
    listEl.appendChild(row);
  });
  const passes = results.filter((r) => r.passed).length;
  footerEl.textContent = `${passes}/${results.length} checks passing • Plan: ${plan}`;
}

function generateExplainTooltip(result) {
  if (result.passed) return 'Looks good according to SOP and heuristics.';
  return `LLM tip: ${result.detail}`;
}

function attachSubmissionGuard(form, resultsRef, config) {
  form.addEventListener('submit', (event) => {
    const failing = resultsRef.filter((r) => !r.passed);
    if (failing.length === 0) return;
    event.preventDefault();
    const message = `${failing.length} SOP issues found:\n- ${failing
      .map((f) => `${f.label}: ${f.detail}`)
      .join('\n- ')}\n\nOverride and submit anyway?`;
    const allowOverride = config.license.pro || !config.teamFeatures.hardBlock;
    const confirmed = allowOverride ? window.confirm(message) : false;
    if (confirmed) {
      if (config.teamFeatures.analytics) {
        console.info('[SOP Guard] Override recorded for analytics.');
      }
      form.removeEventListener('submit', arguments.callee);
      form.submit();
    } else if (!allowOverride) {
      alert('Submission blocked by SOP hard block. Contact an admin to override.');
    }
  });
}

(async function init() {
  const config = await loadConfig();
  const form = findTargetForm();
  if (!form) return;
  const { panel, list, footer } = renderPanel();
  let results = evaluateSop(form, config.rules);
  updatePanel(list, footer, results, config.license.pro ? 'Pro' : 'Free');
  attachSubmissionGuard(form, results, config);

  const observer = new MutationObserver(() => {
    results = evaluateSop(form, config.rules);
    updatePanel(list, footer, results, config.license.pro ? 'Pro' : 'Free');
  });

  observer.observe(form, { subtree: true, childList: true, attributes: true });
  form.addEventListener('input', () => {
    results = evaluateSop(form, config.rules);
    updatePanel(list, footer, results, config.license.pro ? 'Pro' : 'Free');
  });
})();
