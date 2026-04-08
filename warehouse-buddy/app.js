/* ===================================================
   LoadPrep - Warehouse Work Order Scanner
   Application Logic
   =================================================== */

(function () {
  'use strict';

  // ============================================================
  // STATE & STORAGE
  // ============================================================

  const STORAGE_KEY = 'loadprep_customers';
  const MAX_CUSTOMERS = 100;

  let customers = [];
  let editingId = null;
  let pendingDeleteId = null;
  let pendingClearAll = false;
  let scanner = null;

  function saveCustomers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  function loadCustomers() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) customers = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load:', e);
      customers = [];
    }
  }

  // ============================================================
  // UTILITY
  // ============================================================

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function showModal(id) {
    document.getElementById(id).classList.add('show');
  }

  function hideModal(id) {
    document.getElementById(id).classList.remove('show');
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(s => {
      s.classList.toggle('active', s.id === tabName);
    });

    if (tabName === 'database') renderCustomerList();
    if (tabName === 'scan') {
      setTimeout(() => document.getElementById('scan-input').focus(), 100);
    }

    // Close camera if leaving scan tab
    if (tabName !== 'scan') stopCamera();
  }

  // ============================================================
  // LOOKUP
  // ============================================================

  function lookupCode(code) {
    if (!code || !code.trim()) return;
    code = code.trim();

    const resultArea = document.getElementById('result-area');
    const match = customers.find(c =>
      c.code.toLowerCase() === code.toLowerCase()
    );

    if (match) {
      const forkClass = match.hasForklift ? 'forklift-yes' : 'forklift-no';
      const forkText = match.hasForklift
        ? 'FORKLIFT AVAILABLE'
        : 'NO FORKLIFT \u2014 HAND UNLOAD';
      const forkIcon = match.hasForklift ? '\u2705' : '\u{1F6AB}';

      resultArea.innerHTML = `
        <div class="result-card">
          <div class="result-code">\u{1F4CB} ${escapeHtml(match.code)}</div>
          <div class="result-body">
            <div class="result-name">${escapeHtml(match.name)}</div>
            <div class="result-address">\u{1F4CD} ${escapeHtml(match.address)}</div>
            <div class="forklift-banner ${forkClass}">
              <span class="banner-icon">${forkIcon}</span>
              ${forkText}
            </div>
          </div>
        </div>`;
    } else {
      resultArea.innerHTML = `
        <div class="result-not-found">
          <span class="not-found-icon">\u{1F50D}</span>
          <div class="not-found-text">Customer Not Found</div>
          <div class="not-found-code">Code: "${escapeHtml(code)}"</div>
        </div>`;
    }
  }

  // ============================================================
  // BARCODE SCANNER (CAMERA)
  // ============================================================

  function startCamera() {
    const section = document.getElementById('camera-section');
    section.style.display = '';

    if (typeof Html5Qrcode === 'undefined') {
      showToast('Camera scanner library not loaded');
      section.style.display = 'none';
      return;
    }

    scanner = new Html5Qrcode('scanner-container');
    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 280, height: 120 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR
        ]
      },
      (decodedText) => {
        // Barcode scanned successfully
        document.getElementById('scan-input').value = decodedText;
        lookupCode(decodedText);
        stopCamera();
        showToast('Barcode scanned: ' + decodedText);
      },
      () => {
        // Scan error (no barcode found in frame) - ignore
      }
    ).catch((err) => {
      console.warn('Camera start error:', err);
      showToast('Could not access camera');
      section.style.display = 'none';
    });
  }

  function stopCamera() {
    const section = document.getElementById('camera-section');
    if (scanner) {
      scanner.stop().then(() => {
        scanner.clear();
        scanner = null;
      }).catch(() => {
        scanner = null;
      });
    }
    section.style.display = 'none';
  }

  // ============================================================
  // HARDWARE SCANNER SUPPORT
  // ============================================================

  // Hardware barcode scanners send characters rapidly then Enter.
  // We detect this pattern: fast keystrokes ending with Enter.
  let scanBuffer = '';
  let scanTimeout = null;

  function handleScannerInput(e) {
    const input = document.getElementById('scan-input');
    if (document.activeElement !== input) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(scanTimeout);
      const code = input.value.trim();
      if (code) lookupCode(code);
      scanBuffer = '';
      return;
    }

    // Reset buffer timer on each keystroke (hardware scanners are fast)
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => { scanBuffer = ''; }, 500);
  }

  // ============================================================
  // CUSTOMER DATABASE CRUD
  // ============================================================

  function renderCustomerList(filter) {
    const container = document.getElementById('customer-list');
    const countEl = document.getElementById('customer-count');
    const searchTerm = filter || document.getElementById('db-search').value.toLowerCase();

    countEl.textContent = customers.length;

    const filtered = searchTerm
      ? customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm))
      : customers;

    if (filtered.length === 0) {
      container.innerHTML = customers.length === 0
        ? '<p class="empty-state">No customers yet. Add your first customer above!</p>'
        : '<p class="empty-state">No matches found.</p>';
      return;
    }

    container.innerHTML = filtered.map(c => {
      const forkClass = c.hasForklift ? 'has-forklift' : 'no-forklift';
      const forkDot = c.hasForklift ? '\u2705' : '\u274C';
      return `
        <div class="customer-item ${forkClass}">
          <div class="customer-forklift-dot">${forkDot}</div>
          <div class="customer-info">
            <div class="customer-info-code">${escapeHtml(c.code)}</div>
            <div class="customer-info-name">${escapeHtml(c.name)}</div>
            <div class="customer-info-address">${escapeHtml(c.address)}</div>
          </div>
          <div class="customer-actions">
            <button class="btn btn-edit" onclick="LoadPrep.editCustomer('${c.id}')"
                    title="Edit">\u270E</button>
            <button class="btn btn-delete" onclick="LoadPrep.confirmDelete('${c.id}')"
                    title="Delete">\u{1F5D1}</button>
          </div>
        </div>`;
    }).join('');
  }

  function openAddCustomer() {
    if (customers.length >= MAX_CUSTOMERS) {
      showToast('Database full (100 max). Delete some first.');
      return;
    }
    editingId = null;
    document.getElementById('modal-title').textContent = 'Add Customer';
    document.getElementById('cust-code').value = '';
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-address').value = '';
    setForkliftToggle(true);
    showModal('customer-modal');
    document.getElementById('cust-code').focus();
  }

  function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Customer';
    document.getElementById('cust-code').value = customer.code;
    document.getElementById('cust-name').value = customer.name;
    document.getElementById('cust-address').value = customer.address;
    setForkliftToggle(customer.hasForklift);
    showModal('customer-modal');
  }

  function saveCustomer() {
    const code = document.getElementById('cust-code').value.trim();
    const name = document.getElementById('cust-name').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const hasForklift = document.getElementById('toggle-yes').classList.contains('active');

    if (!code || !name || !address) {
      showToast('Please fill in all fields');
      return;
    }

    // Check for duplicate code (excluding current if editing)
    const duplicate = customers.find(c =>
      c.code.toLowerCase() === code.toLowerCase() && c.id !== editingId
    );
    if (duplicate) {
      showToast('Code "' + code + '" already exists');
      return;
    }

    if (editingId) {
      // Update existing
      const idx = customers.findIndex(c => c.id === editingId);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], code, name, address, hasForklift };
      }
      showToast('Customer updated');
    } else {
      // Add new
      if (customers.length >= MAX_CUSTOMERS) {
        showToast('Database full (100 max)');
        return;
      }
      customers.push({ id: generateId(), code, name, address, hasForklift });
      showToast('Customer added');
    }

    saveCustomers();
    hideModal('customer-modal');
    renderCustomerList();
    editingId = null;
  }

  function confirmDelete(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    pendingDeleteId = id;
    pendingClearAll = false;
    document.getElementById('confirm-message').textContent =
      'Delete "' + customer.name + '" (' + customer.code + ')?';
    document.getElementById('confirm-action-btn').textContent = 'Delete';
    showModal('confirm-modal');
  }

  function confirmClearAll() {
    if (customers.length === 0) {
      showToast('Database is already empty');
      return;
    }
    pendingClearAll = true;
    pendingDeleteId = null;
    document.getElementById('confirm-message').textContent =
      'Delete ALL ' + customers.length + ' customers? This cannot be undone.';
    document.getElementById('confirm-action-btn').textContent = 'Delete All';
    showModal('confirm-modal');
  }

  function executeConfirmedAction() {
    if (pendingClearAll) {
      customers = [];
      saveCustomers();
      showToast('All customers deleted');
      renderCustomerList();
    } else if (pendingDeleteId) {
      customers = customers.filter(c => c.id !== pendingDeleteId);
      saveCustomers();
      showToast('Customer deleted');
      renderCustomerList();
    }
    pendingDeleteId = null;
    pendingClearAll = false;
    hideModal('confirm-modal');
  }

  function setForkliftToggle(value) {
    const yesBtn = document.getElementById('toggle-yes');
    const noBtn = document.getElementById('toggle-no');
    if (value) {
      yesBtn.classList.add('active');
      noBtn.classList.remove('active');
    } else {
      yesBtn.classList.remove('active');
      noBtn.classList.add('active');
    }
  }

  // ============================================================
  // IMPORT / EXPORT
  // ============================================================

  function importCSV() {
    const text = document.getElementById('import-text').value.trim();
    if (!text) {
      showToast('Paste CSV data first');
      return;
    }

    const lines = text.split('\n').filter(l => l.trim());
    let imported = 0;
    let skipped = 0;

    for (const line of lines) {
      if (customers.length >= MAX_CUSTOMERS) {
        skipped += lines.length - imported - skipped;
        break;
      }

      // Split by comma, but be forgiving with whitespace
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 4) {
        skipped++;
        continue;
      }

      const code = parts[0];
      const name = parts[1];
      // Address might contain commas, so join middle parts
      const forkliftStr = parts[parts.length - 1].toLowerCase();
      const address = parts.slice(2, parts.length - 1).join(', ');
      const hasForklift = forkliftStr === 'yes' || forkliftStr === 'y' || forkliftStr === 'true';

      if (!code || !name || !address) {
        skipped++;
        continue;
      }

      // Skip duplicates
      if (customers.find(c => c.code.toLowerCase() === code.toLowerCase())) {
        skipped++;
        continue;
      }

      customers.push({ id: generateId(), code, name, address, hasForklift });
      imported++;
    }

    saveCustomers();
    document.getElementById('import-text').value = '';
    showToast(imported + ' imported, ' + skipped + ' skipped');
    renderCustomerList();
  }

  function exportCSV() {
    if (customers.length === 0) {
      showToast('No customers to export');
      return;
    }

    const lines = customers.map(c =>
      [c.code, c.name, c.address, c.hasForklift ? 'yes' : 'no'].join(', ')
    );
    const csv = 'Code, Name, Address, Has Forklift\n' + lines.join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loadprep-customers.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded');
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  function init() {
    loadCustomers();

    // Tab nav
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Scan input - auto lookup on Enter or via hardware scanner
    document.addEventListener('keydown', handleScannerInput);

    // Lookup button
    document.getElementById('lookup-btn').addEventListener('click', () => {
      const code = document.getElementById('scan-input').value.trim();
      if (code) lookupCode(code);
    });

    // Auto-select input text on focus for quick re-scan
    document.getElementById('scan-input').addEventListener('focus', function () {
      this.select();
    });

    // Camera scan
    document.getElementById('camera-scan-btn').addEventListener('click', () => {
      if (scanner) {
        stopCamera();
      } else {
        startCamera();
      }
    });
    document.getElementById('close-camera-btn').addEventListener('click', stopCamera);

    // Add customer
    document.getElementById('add-customer-btn').addEventListener('click', openAddCustomer);

    // Save customer
    document.getElementById('save-customer-btn').addEventListener('click', saveCustomer);

    // Forklift toggle
    document.getElementById('toggle-yes').addEventListener('click', () => setForkliftToggle(true));
    document.getElementById('toggle-no').addEventListener('click', () => setForkliftToggle(false));

    // Close modals
    document.getElementById('close-modal-btn').addEventListener('click', () => hideModal('customer-modal'));
    document.getElementById('cancel-modal-btn').addEventListener('click', () => hideModal('customer-modal'));
    document.getElementById('close-confirm-btn').addEventListener('click', () => hideModal('confirm-modal'));
    document.getElementById('cancel-confirm-btn').addEventListener('click', () => hideModal('confirm-modal'));
    document.getElementById('confirm-action-btn').addEventListener('click', executeConfirmedAction);

    // Overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideModal(overlay.id);
      });
    });

    // Search
    document.getElementById('db-search').addEventListener('input', () => {
      renderCustomerList();
    });

    // Import / Export
    document.getElementById('import-btn').addEventListener('click', importCSV);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    document.getElementById('clear-db-btn').addEventListener('click', confirmClearAll);

    // Allow Enter key in modal inputs to save
    const modalInputs = ['cust-code', 'cust-name', 'cust-address'];
    modalInputs.forEach(id => {
      document.getElementById(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveCustomer();
      });
    });

    // Initial render
    renderCustomerList();
    document.getElementById('scan-input').focus();
  }

  // Public API for inline event handlers
  window.LoadPrep = {
    editCustomer,
    confirmDelete
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
