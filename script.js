/**
 * NexusCloud Enterprise Dashboard
 * Interactive JavaScript Engine: Responsive Navigation, Themes, SVG Charts, Table & Popovers
 */

(function () {
  'use strict';

  // --- DOM Elements Cache ---
  const htmlEl = document.documentElement;
  const appContainer = document.getElementById('appContainer');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const sunIcon = document.querySelector('.theme-icon-sun');
  const moonIcon = document.querySelector('.theme-icon-moon');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarCollapseToggle = document.getElementById('sidebarCollapseToggle');
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const toastContainer = document.getElementById('toastContainer');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const generateReportBtn = document.getElementById('generateReportBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const upgradePlanBtn = document.getElementById('upgradePlanBtn');

  // Timeframe and KPI elements
  const timeframePills = document.querySelectorAll('.filter-pill-btn');
  const kpiRevenue = document.getElementById('kpiRevenue');
  const kpiSubscribers = document.getElementById('kpiSubscribers');
  const kpiAov = document.getElementById('kpiAov');
  const kpiUptime = document.getElementById('kpiUptime');

  // Chart elements
  const revAreaPath = document.getElementById('revAreaPath');
  const revLinePath = document.getElementById('revLinePath');
  const costAreaPath = document.getElementById('costAreaPath');
  const costLinePath = document.getElementById('costLinePath');
  const chartPoints = document.querySelectorAll('.chart-point');
  const chartTooltip = document.getElementById('chartTooltip');
  const chartContainer = document.getElementById('revenueChartContainer');
  const donutSlices = document.querySelectorAll('.donut-slice');
  const donutValueDisplay = document.getElementById('donutValueDisplay');
  const donutLabelDisplay = document.getElementById('donutLabelDisplay');

  // Table elements
  const tableSearchInput = document.getElementById('tableSearchInput');
  const statusFilterSelect = document.getElementById('statusFilterSelect');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const tableBody = document.getElementById('tableBody');
  const pageButtons = document.querySelectorAll('.pagination-controls .page-btn:not(#prevPageBtn):not(#nextPageBtn)');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const paginationInfo = document.getElementById('paginationInfo');

  /* ==========================================================================
     1. THEME CONTROLLER (LIGHT / DARK MODE)
     ========================================================================== */
  const THEME_STORAGE_KEY = 'nexus-dashboard-theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      applyTheme(savedTheme, false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light', false);
    }
  }

  function applyTheme(theme, notify = true) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }

    if (notify) {
      showToast(`Switched to ${theme === 'dark' ? 'Dark' : 'Light'} theme`);
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme, true);
    });
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION DRAWER & FOCUS MANAGEMENT
     ========================================================================== */
  function openMobileSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('is-active');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Focus the first actionable item in the drawer
    const firstFocusable = sidebar.querySelector('button, a');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMobileSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('is-active');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Desktop sidebar collapse rail toggle
  if (sidebarCollapseToggle) {
    sidebarCollapseToggle.addEventListener('click', () => {
      const isCollapsed = appContainer.getAttribute('data-sidebar-collapsed') === 'true';
      appContainer.setAttribute('data-sidebar-collapsed', (!isCollapsed).toString());
      sidebarCollapseToggle.setAttribute('aria-label', isCollapsed ? 'Collapse sidebar' : 'Expand sidebar');
      showToast(isCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed to rail mode');
    });
  }

  // Close mobile drawer when clicking navigation links
  const navLinks = document.querySelectorAll('.nav-item-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => {
        l.classList.remove('active');
        l.removeAttribute('aria-current');
      });
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      if (window.innerWidth < 1024) {
        closeMobileSidebar();
      }
    });
  });

  /* ==========================================================================
     3. DROPDOWNS & POPOVERS (NOTIFICATIONS & USER PROFILE)
     ========================================================================== */
  function closeAllDropdowns() {
    if (notificationsDropdown) notificationsDropdown.classList.remove('is-open');
    if (notificationsBtn) notificationsBtn.setAttribute('aria-expanded', 'false');
    if (profileDropdown) profileDropdown.classList.remove('is-open');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
  }

  if (notificationsBtn && notificationsDropdown) {
    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notificationsDropdown.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        notificationsDropdown.classList.add('is-open');
        notificationsBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = profileDropdown.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        profileDropdown.classList.add('is-open');
        profileBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Dismiss on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notificationsDropdown') && !e.target.closest('#notificationsBtn') &&
        !e.target.closest('#profileDropdown') && !e.target.closest('#profileBtn')) {
      closeAllDropdowns();
    }
  });

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      const badge = document.querySelector('.notification-badge');
      if (badge) badge.style.display = 'none';
      closeAllDropdowns();
      showToast('All notifications marked as read');
    });
  }

  /* ==========================================================================
     4. TIMEFRAME SELECTOR & INTERACTIVE SVG CHART
     ========================================================================== */
  const chartDataSets = {
    '24h': {
      revenue: '$14,280.00',
      subscribers: '42,850',
      aov: '$186.40',
      uptime: '100.0%',
      revPathD: 'M 50 180 L 50 150 Q 135 140, 220 130 T 390 90 T 560 70 L 560 180 Z',
      revLineD: 'M 50 150 Q 135 140, 220 130 T 390 90 T 560 70',
      costPathD: 'M 50 180 L 50 160 Q 135 155, 220 145 T 390 120 T 560 110 L 560 180 Z',
      costLineD: 'M 50 160 Q 135 155, 220 145 T 390 120 T 560 110',
      pointValues: ['$1.8k', '$2.4k', '$3.1k', '$5.6k', '$8.2k', '$11.5k', '$14.3k']
    },
    '7d': {
      revenue: '$48,920.00',
      subscribers: '42,420',
      aov: '$185.10',
      uptime: '99.99%',
      revPathD: 'M 50 180 L 50 135 Q 135 120, 220 110 T 390 70 T 560 50 L 560 180 Z',
      revLineD: 'M 50 135 Q 135 120, 220 110 T 390 70 T 560 50',
      costPathD: 'M 50 180 L 50 150 Q 135 140, 220 130 T 390 100 T 560 85 L 560 180 Z',
      costLineD: 'M 50 150 Q 135 140, 220 130 T 390 100 T 560 85',
      pointValues: ['$6.2k', '$9.8k', '$14.5k', '$21.0k', '$29.4k', '$38.2k', '$48.9k']
    },
    '30d': {
      revenue: '$128,430.00',
      subscribers: '42,850',
      aov: '$184.20',
      uptime: '99.98%',
      revPathD: 'M 50 180 L 50 120 Q 135 105, 220 90 T 390 55 T 560 40 L 560 180 Z',
      revLineD: 'M 50 120 Q 135 105, 220 90 T 390 55 T 560 40',
      costPathD: 'M 50 180 L 50 140 Q 135 150, 220 135 T 390 110 T 560 90 L 560 180 Z',
      costLineD: 'M 50 140 Q 135 150, 220 135 T 390 110 T 560 90',
      pointValues: ['$64,200', '$78,500', '$92,300', '$108,100', '$119,400', '$124,800', '$128,430']
    },
    '90d': {
      revenue: '$392,100.00',
      subscribers: '44,200',
      aov: '$188.90',
      uptime: '99.97%',
      revPathD: 'M 50 180 L 50 110 Q 135 90, 220 75 T 390 45 T 560 30 L 560 180 Z',
      revLineD: 'M 50 110 Q 135 90, 220 75 T 390 45 T 560 30',
      costPathD: 'M 50 180 L 50 130 Q 135 125, 220 115 T 390 85 T 560 70 L 560 180 Z',
      costLineD: 'M 50 130 Q 135 125, 220 115 T 390 85 T 560 70',
      pointValues: ['$180k', '$215k', '$254k', '$298k', '$340k', '$368k', '$392k']
    },
    '1y': {
      revenue: '$1,480,200.00',
      subscribers: '48,600',
      aov: '$192.50',
      uptime: '99.98%',
      revPathD: 'M 50 180 L 50 95 Q 135 80, 220 60 T 390 35 T 560 25 L 560 180 Z',
      revLineD: 'M 50 95 Q 135 80, 220 60 T 390 35 T 560 25',
      costPathD: 'M 50 180 L 50 120 Q 135 110, 220 95 T 390 65 T 560 55 L 560 180 Z',
      costLineD: 'M 50 120 Q 135 110, 220 95 T 390 65 T 560 55',
      pointValues: ['$840k', '$920k', '$1.05M', '$1.18M', '$1.29M', '$1.38M', '$1.48M']
    }
  };

  timeframePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const timeframe = pill.getAttribute('data-timeframe');
      timeframePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const data = chartDataSets[timeframe];
      if (data) {
        if (kpiRevenue) kpiRevenue.textContent = data.revenue;
        if (kpiSubscribers) kpiSubscribers.textContent = data.subscribers;
        if (kpiAov) kpiAov.textContent = data.aov;
        if (kpiUptime) kpiUptime.textContent = data.uptime;

        if (revAreaPath) revAreaPath.setAttribute('d', data.revPathD);
        if (revLinePath) revLinePath.setAttribute('d', data.revLineD);
        if (costAreaPath) costAreaPath.setAttribute('d', data.costPathD);
        if (costLinePath) costLinePath.setAttribute('d', data.costLineD);

        chartPoints.forEach((point, idx) => {
          if (data.pointValues[idx]) {
            point.setAttribute('data-val', data.pointValues[idx]);
          }
        });

        showToast(`Telemetry updated for ${timeframe} timeframe`);
      }
    });
  });

  // Chart hover tooltips
  chartPoints.forEach(point => {
    point.addEventListener('mouseenter', (e) => {
      const val = point.getAttribute('data-val');
      const label = point.getAttribute('data-label');
      if (chartTooltip && chartContainer) {
        chartTooltip.innerHTML = `<strong>${label}</strong>: ${val}`;
        const containerRect = chartContainer.getBoundingClientRect();
        const pointRect = point.getBoundingClientRect();
        const left = pointRect.left - containerRect.left + pointRect.width / 2;
        const top = pointRect.top - containerRect.top;
        chartTooltip.style.left = `${left}px`;
        chartTooltip.style.top = `${top}px`;
        chartTooltip.classList.add('is-visible');
      }
    });

    point.addEventListener('mouseleave', () => {
      if (chartTooltip) chartTooltip.classList.remove('is-visible');
    });
  });

  // Donut chart hover highlight
  donutSlices.forEach(slice => {
    slice.addEventListener('mouseenter', () => {
      const val = slice.getAttribute('data-val');
      const label = slice.getAttribute('data-label');
      if (donutValueDisplay) donutValueDisplay.textContent = val;
      if (donutLabelDisplay) donutLabelDisplay.textContent = label;
    });

    slice.addEventListener('mouseleave', () => {
      if (donutValueDisplay) donutValueDisplay.textContent = '1.42M';
      if (donutLabelDisplay) donutLabelDisplay.textContent = 'Req / min';
    });
  });

  /* ==========================================================================
     5. RESPONSIVE DATA TABLE SEARCH, FILTER & SELECTION
     ========================================================================= */
  function filterTable() {
    if (!tableBody) return;
    const query = (tableSearchInput ? tableSearchInput.value : '').toLowerCase().trim();
    const selectedStatus = statusFilterSelect ? statusFilterSelect.value : 'all';
    const rows = tableBody.querySelectorAll('tr');

    let visibleCount = 0;
    rows.forEach(row => {
      const rowStatus = row.getAttribute('data-status');
      const text = row.textContent.toLowerCase();

      const matchesStatus = (selectedStatus === 'all' || rowStatus === selectedStatus);
      const matchesSearch = (!query || text.includes(query));

      if (matchesStatus && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (paginationInfo) {
      paginationInfo.innerHTML = `Showing <strong>1</strong> to <strong>${visibleCount}</strong> of <strong>${visibleCount}</strong> filtered results`;
    }
  }

  if (tableSearchInput) {
    tableSearchInput.addEventListener('input', filterTable);
  }

  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', filterTable);
  }

  // Select all checkbox functionality
  if (selectAllCheckbox && tableBody) {
    selectAllCheckbox.addEventListener('change', () => {
      const rowCheckboxes = tableBody.querySelectorAll('.row-checkbox');
      rowCheckboxes.forEach(cb => {
        if (cb.closest('tr').style.display !== 'none') {
          cb.checked = selectAllCheckbox.checked;
        }
      });
    });

    tableBody.addEventListener('change', (e) => {
      if (e.target.classList.contains('row-checkbox')) {
        const rowCheckboxes = Array.from(tableBody.querySelectorAll('.row-checkbox')).filter(cb => cb.closest('tr').style.display !== 'none');
        const allChecked = rowCheckboxes.every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
      }
    });
  }

  // Pagination button interactions
  pageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pageButtons.forEach(b => {
        b.classList.remove('active');
        b.removeAttribute('aria-current');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
      const pageNum = btn.textContent.trim();
      if (prevPageBtn) prevPageBtn.disabled = (pageNum === '1');
      if (nextPageBtn) nextPageBtn.disabled = (pageNum === '4');
      if (paginationInfo) {
        paginationInfo.innerHTML = `Showing page <strong>${pageNum}</strong> of <strong>4</strong> (24 total entries)`;
      }
      showToast(`Navigated to Table Page ${pageNum}`);
    });
  });

  // Table action buttons
  const actionButtons = document.querySelectorAll('.table-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = btn.closest('tr');
      const txId = row ? row.querySelector('code').textContent : 'TX';
      showToast(`Opened inspection drawer for ${txId}`);
    });
  });

  /* ==========================================================================
     6. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger reflow to animate
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  /* ==========================================================================
     7. BUTTON ACTION TRIGGERS & SHORTCUTS
     ========================================================================== */
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      showToast('Exporting dashboard telemetry as JSON...');
    });
  }

  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      showToast('Compiling custom infrastructure SLA report...');
    });
  }

  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => {
      showToast('Generated audit CSV export: 6 records downloaded.');
    });
  }

  if (upgradePlanBtn) {
    upgradePlanBtn.addEventListener('click', () => {
      showToast('Opening storage capacity configuration...');
    });
  }

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Escape)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (globalSearchInput) {
        globalSearchInput.focus();
        showToast('Global Search active');
      }
    } else if (e.key === 'Escape') {
      closeAllDropdowns();
      closeMobileSidebar();
    }
  });

  // Initialize on DOM ready
  initTheme();
})();
