/**
 * BookVerse - Frontend Application Logic & REST API Client
 * Manages UI interactions, real-time REST API queries, modals, and the live API tester.
 */

// Application State
const state = {
  books: [],
  authors: [],
  stats: {},
  currentView: 'library',
  layoutView: 'grid',
  searchQuery: '',
  selectedGenre: '',
  sortBy: 'id-asc',
  selectedBook: null,
};

// Cover gradient generator based on book ID
const coverGradients = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0284c7 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
];

function getCoverGradient(id) {
  const index = (id || 1) % coverGradients.length;
  return coverGradients[index];
}

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const elements = {
  // Navigation
  tabLibrary: document.getElementById('tab-library'),
  tabAuthors: document.getElementById('tab-authors'),
  tabApiDocs: document.getElementById('tab-api-docs'),
  booksCountBadge: document.getElementById('books-count-badge'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  openAddBookBtn: document.getElementById('open-add-book-btn'),

  // Views
  viewLibrary: document.getElementById('view-library'),
  viewAuthors: document.getElementById('view-authors'),
  viewApiDocs: document.getElementById('view-api-docs'),

  // Stats
  statTotalBooks: document.getElementById('stat-total-books'),
  statTotalAuthors: document.getElementById('stat-total-authors'),
  statTotalGenres: document.getElementById('stat-total-genres'),
  statAvgRating: document.getElementById('stat-avg-rating'),

  // Library Controls
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  genreFilter: document.getElementById('genre-filter'),
  sortSelect: document.getElementById('sort-select'),
  btnGridView: document.getElementById('btn-grid-view'),
  btnTableView: document.getElementById('btn-table-view'),
  btnResetDb: document.getElementById('btn-reset-db'),
  btnClearFilters: document.getElementById('btn-clear-filters'),

  // Containers
  booksGrid: document.getElementById('books-grid'),
  booksTableWrapper: document.getElementById('books-table-wrapper'),
  booksTableBody: document.getElementById('books-table-body'),
  emptyState: document.getElementById('empty-state'),
  authorsGrid: document.getElementById('authors-grid'),

  // Add / Edit Modal
  bookModal: document.getElementById('book-modal'),
  modalTitle: document.getElementById('modal-title'),
  bookForm: document.getElementById('book-form'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),
  formBookId: document.getElementById('form-book-id'),
  formTitle: document.getElementById('form-title'),
  formAuthor: document.getElementById('form-author'),
  formGenre: document.getElementById('form-genre'),
  formYear: document.getElementById('form-year'),
  formRating: document.getElementById('form-rating'),
  formPages: document.getElementById('form-pages'),
  formIsbn: document.getElementById('form-isbn'),
  formStatus: document.getElementById('form-status'),
  formDescription: document.getElementById('form-description'),

  // Details Modal
  detailsModal: document.getElementById('details-modal'),
  detailsCloseBtn: document.getElementById('details-close-btn'),
  detailsDoneBtn: document.getElementById('details-done-btn'),
  detailsEditBtn: document.getElementById('details-edit-btn'),
  detailsBody: document.getElementById('details-body'),

  // API Console
  consoleMethod: document.getElementById('console-method'),
  consoleEndpoint: document.getElementById('console-endpoint'),
  consoleBodyWrapper: document.getElementById('console-body-wrapper'),
  consoleRequestPayload: document.getElementById('console-request-payload'),
  btnSendApiRequest: document.getElementById('btn-send-api-request'),
  responseStatusBadge: document.getElementById('response-status-badge'),
  responseTimeBadge: document.getElementById('response-time-badge'),
  consoleResponseOutput: document.getElementById('console-response-output'),

  // Toast Container
  toastContainer: document.getElementById('toast-container'),
  footerApiLink: document.getElementById('footer-api-link'),
};

// ============================================================================
// API SERVICE (REST Client)
// ============================================================================
const api = {
  async getBooks(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.author) query.append('author', params.author);
    if (params.genre) query.append('genre', params.genre);
    if (params.sort) query.append('sort', params.sort);
    if (params.order) query.append('order', params.order);

    const url = `/api/books${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getBook(id) {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async createBook(payload) {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create book');
    return data;
  },

  async updateBook(id, payload) {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update book');
    return data;
  },

  async deleteBook(id) {
    const res = await fetch(`/api/books/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete book');
    return data;
  },

  async getAuthors() {
    const res = await fetch('/api/authors');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getStats() {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async resetData() {
    const res = await fetch('/api/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset data');
    return data;
  }
};

// ============================================================================
// UI RENDERING
// ============================================================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${escapeHTML(message)}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStats(stats) {
  elements.statTotalBooks.textContent = stats.total_books ?? 0;
  elements.statTotalAuthors.textContent = stats.total_authors ?? 0;
  elements.statTotalGenres.textContent = stats.total_genres ?? 0;
  elements.statAvgRating.textContent = stats.average_rating ? `${stats.average_rating} ★` : '-';
  elements.booksCountBadge.textContent = stats.total_books ?? 0;
}

function updateGenreFilterOptions(books) {
  const currentVal = elements.genreFilter.value;
  const genres = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();

  elements.genreFilter.innerHTML = '<option value="">All Genres</option>';
  genres.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    if (g === currentVal) opt.selected = true;
    elements.genreFilter.appendChild(opt);
  });
}

function renderBooksGrid(books) {
  elements.booksGrid.innerHTML = '';

  if (books.length === 0) {
    elements.booksGrid.style.display = 'none';
    elements.booksTableWrapper.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  if (state.layoutView === 'table') {
    elements.booksGrid.style.display = 'none';
    elements.booksTableWrapper.style.display = 'block';
    renderBooksTable(books);
    return;
  }

  elements.booksGrid.style.display = 'grid';
  elements.booksTableWrapper.style.display = 'none';

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.id = `book-card-${book.id}`;

    const gradient = getCoverGradient(book.id);
    const isBorrowed = (book.status || '').toLowerCase() === 'borrowed';

    card.innerHTML = `
      <div class="book-cover-banner" style="background: ${gradient}">
        <span class="book-id-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <line x1="10" y1="3" x2="8" y2="21"></line>
            <line x1="16" y1="3" x2="14" y2="21"></line>
          </svg>
          ID: #${book.id}
        </span>
        <span class="book-status-pill ${isBorrowed ? 'borrowed' : ''}">${escapeHTML(book.status || 'Available')}</span>
      </div>

      <div class="book-content">
        <h3 class="book-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</h3>
        <div class="book-author">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${escapeHTML(book.author)}</span>
        </div>

        <div class="book-meta-chips">
          <span class="chip">${escapeHTML(book.genre || 'General')}</span>
          ${book.year ? `<span class="chip">${book.year}</span>` : ''}
          <span class="chip chip-rating">★ ${book.rating ? Number(book.rating).toFixed(1) : '4.0'}</span>
        </div>

        <p class="book-desc">${escapeHTML(book.description || 'No description provided.')}</p>

        <div class="book-card-actions">
          <button class="btn btn-outline btn-details" data-id="${book.id}">Details</button>
          <div class="action-btn-group">
            <button class="btn-icon btn-edit" data-id="${book.id}" title="Edit Book">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-delete" data-id="${book.id}" title="Delete Book">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelector('.btn-details').addEventListener('click', () => openDetailsModal(book.id));
    card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(book.id));
    card.querySelector('.btn-delete').addEventListener('click', () => confirmDeleteBook(book.id, book.title));

    elements.booksGrid.appendChild(card);
  });
}

function renderBooksTable(books) {
  elements.booksTableBody.innerHTML = '';
  books.forEach(book => {
    const tr = document.createElement('tr');
    tr.id = `table-row-${book.id}`;
    const isBorrowed = (book.status || '').toLowerCase() === 'borrowed';

    tr.innerHTML = `
      <td><span class="table-id-pill">#${book.id}</span></td>
      <td><strong>${escapeHTML(book.title)}</strong></td>
      <td class="table-author-cell">${escapeHTML(book.author)}</td>
      <td><span class="chip">${escapeHTML(book.genre || 'General')}</span></td>
      <td>${book.year || '-'}</td>
      <td><span class="chip chip-rating">★ ${book.rating ? Number(book.rating).toFixed(1) : '4.0'}</span></td>
      <td><span class="book-status-pill ${isBorrowed ? 'borrowed' : ''}">${escapeHTML(book.status || 'Available')}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon btn-view-table" data-id="${book.id}" title="View Details">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <button class="btn-icon btn-edit" data-id="${book.id}" title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="btn-icon btn-delete" data-id="${book.id}" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-view-table').addEventListener('click', () => openDetailsModal(book.id));
    tr.querySelector('.btn-edit').addEventListener('click', () => openEditModal(book.id));
    tr.querySelector('.btn-delete').addEventListener('click', () => confirmDeleteBook(book.id, book.title));

    elements.booksTableBody.appendChild(tr);
  });
}

function renderAuthors(authors) {
  elements.authorsGrid.innerHTML = '';
  if (authors.length === 0) {
    elements.authorsGrid.innerHTML = '<p class="text-muted">No authors found.</p>';
    return;
  }

  authors.forEach(item => {
    const card = document.createElement('div');
    card.className = 'author-card';
    const initial = (item.author || 'A').charAt(0).toUpperCase();

    const titlesList = (item.book_titles || '').split(' | ');

    card.innerHTML = `
      <div class="author-header">
        <div class="author-avatar">${initial}</div>
        <div>
          <div class="author-name">${escapeHTML(item.author)}</div>
          <div class="author-count-badge">${item.book_count} ${item.book_count === 1 ? 'Book' : 'Books'} in Catalog</div>
        </div>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600; margin-top: 6px;">Published Titles:</div>
      <ul class="author-books-list">
        ${titlesList.map(t => `<li class="author-book-item">${escapeHTML(t)}</li>`).join('')}
      </ul>
    `;
    elements.authorsGrid.appendChild(card);
  });
}

// ============================================================================
// MODAL INTERACTIONS
// ============================================================================

function openAddModal() {
  elements.modalTitle.textContent = 'Add New Book';
  elements.formBookId.value = '';
  elements.bookForm.reset();
  elements.formRating.value = '4.5';
  elements.formStatus.value = 'Available';
  elements.bookModal.style.display = 'flex';
  elements.formTitle.focus();
}

async function openEditModal(bookId) {
  try {
    const res = await api.getBook(bookId);
    const book = res.data;
    elements.modalTitle.textContent = `Edit Book (ID: #${book.id})`;
    elements.formBookId.value = book.id;
    elements.formTitle.value = book.title || '';
    elements.formAuthor.value = book.author || '';
    elements.formGenre.value = book.genre || '';
    elements.formYear.value = book.year || '';
    elements.formRating.value = book.rating ?? 4.0;
    elements.formPages.value = book.pages || '';
    elements.formIsbn.value = book.isbn || '';
    elements.formStatus.value = book.status || 'Available';
    elements.formDescription.value = book.description || '';

    // Close details modal if open
    elements.detailsModal.style.display = 'none';
    elements.bookModal.style.display = 'flex';
    elements.formTitle.focus();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openDetailsModal(bookId) {
  try {
    const res = await api.getBook(bookId);
    const book = res.data;
    state.selectedBook = book;

    elements.detailsBody.innerHTML = `
      <div class="details-hero">
        <div>
          <h2 class="details-title">${escapeHTML(book.title)}</h2>
          <div class="details-author">by ${escapeHTML(book.author)}</div>
        </div>
        <span class="book-id-badge" style="font-size: 0.85rem; padding: 6px 12px;">ID: #${book.id}</span>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Genre</span>
          <span class="detail-value">${escapeHTML(book.genre || 'General')}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Publication Year</span>
          <span class="detail-value">${book.year || 'Unknown'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">ISBN</span>
          <span class="detail-value">${escapeHTML(book.isbn || 'N/A')}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Rating</span>
          <span class="detail-value">★ ${book.rating ? Number(book.rating).toFixed(1) : '4.0'} / 5.0</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Page Count</span>
          <span class="detail-value">${book.pages ? `${book.pages} pages` : 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="detail-value">${escapeHTML(book.status || 'Available')}</span>
        </div>
      </div>

      <div class="details-desc-box">
        <h4>Synopsis / Overview</h4>
        <p>${escapeHTML(book.description || 'No summary available for this book.')}</p>
      </div>

      <div class="details-raw-json">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">REST API JSON Payload:</span>
          <button class="btn btn-ghost" id="copy-json-btn" style="padding: 4px 8px; font-size: 0.75rem;">Copy JSON</button>
        </div>
        <pre><code>${escapeHTML(JSON.stringify(book, null, 2))}</code></pre>
      </div>
    `;

    document.getElementById('copy-json-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(book, null, 2));
      showToast('Book JSON copied to clipboard!');
    });

    elements.detailsEditBtn.onclick = () => openEditModal(book.id);
    elements.detailsModal.style.display = 'flex';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmDeleteBook(bookId, title) {
  if (confirm(`Are you sure you want to delete "${title}" (ID: #${bookId})?`)) {
    try {
      await api.deleteBook(bookId);
      showToast(`Book #${bookId} successfully deleted.`);
      await reloadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

// ============================================================================
// DATA LOADING & REFRESH
// ============================================================================

async function reloadAllData() {
  try {
    const [sortCol, orderDir] = state.sortBy.split('-');
    const booksRes = await api.getBooks({
      q: state.searchQuery,
      genre: state.selectedGenre,
      sort: sortCol,
      order: orderDir
    });

    state.books = booksRes.data || [];
    renderBooksGrid(state.books);

    const [authorsRes, statsRes] = await Promise.all([
      api.getAuthors(),
      api.getStats()
    ]);

    state.authors = authorsRes.data || [];
    state.stats = statsRes.data || {};

    renderAuthors(state.authors);
    renderStats(state.stats);
    updateGenreFilterOptions(state.books);
  } catch (err) {
    showToast(`Error connecting to REST API: ${err.message}`, 'error');
  }
}

// ============================================================================
// LIVE REST API EXPLORER CONSOLE
// ============================================================================

function setupApiConsole() {
  const methodSelect = elements.consoleMethod;
  const endpointInput = elements.consoleEndpoint;
  const bodyWrapper = elements.consoleBodyWrapper;
  const payloadTextarea = elements.consoleRequestPayload;
  const sendBtn = elements.btnSendApiRequest;

  // Preset endpoints when method changes
  methodSelect.addEventListener('change', () => {
    const method = methodSelect.value;
    if (method === 'POST') {
      endpointInput.value = '/api/books';
      bodyWrapper.style.display = 'block';
      payloadTextarea.value = JSON.stringify({
        title: "Clean Architecture",
        author: "Robert C. Martin",
        genre: "Software Engineering",
        year: 2017,
        isbn: "978-0134494166",
        rating: 4.8,
        pages: 432,
        description: "Universal rules of software structure and architecture for building robust systems."
      }, null, 2);
    } else if (method === 'PUT') {
      endpointInput.value = '/api/books/1';
      bodyWrapper.style.display = 'block';
      payloadTextarea.value = JSON.stringify({
        title: "Clean Code: Refactored Edition",
        author: "Robert C. Martin",
        rating: 4.9
      }, null, 2);
    } else if (method === 'DELETE') {
      endpointInput.value = '/api/books/10';
      bodyWrapper.style.display = 'none';
    } else { // GET
      endpointInput.value = '/api/books';
      bodyWrapper.style.display = 'none';
    }
  });

  sendBtn.addEventListener('click', async () => {
    const method = methodSelect.value;
    const path = endpointInput.value.trim();
    const url = path.startsWith('/') ? path : `/${path}`;

    elements.responseStatusBadge.textContent = 'Sending...';
    elements.responseStatusBadge.className = 'status-badge';
    elements.consoleResponseOutput.textContent = 'Executing HTTP request...';

    const startTime = performance.now();
    try {
      const options = { method };
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = payloadTextarea.value.trim() || '{}';
      }

      const res = await fetch(url, options);
      const latency = Math.round(performance.now() - startTime);

      let responseData;
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }

      elements.responseStatusBadge.textContent = `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`;
      elements.responseStatusBadge.className = `status-badge status-${res.status}`;
      elements.responseTimeBadge.textContent = `Time: ${latency}ms`;
      elements.consoleResponseOutput.textContent = typeof responseData === 'object' 
        ? JSON.stringify(responseData, null, 2)
        : responseData;

      // If data was mutated, automatically refresh app data
      if (['POST', 'PUT', 'DELETE'].includes(method) && res.ok) {
        showToast(`API ${method} succeeded! Refreshing catalog data.`);
        reloadAllData();
      }
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      elements.responseStatusBadge.textContent = 'Error';
      elements.responseStatusBadge.className = 'status-badge status-500';
      elements.responseTimeBadge.textContent = `Time: ${latency}ms`;
      elements.consoleResponseOutput.textContent = JSON.stringify({
        error: "Network / Fetch Error",
        details: err.message
      }, null, 2);
    }
  });
}

// ============================================================================
// EVENT LISTENERS INITIALIZATION
// ============================================================================

function initEventListeners() {
  // Navigation Tabs
  const tabs = [
    { btn: elements.tabLibrary, view: elements.viewLibrary, name: 'library' },
    { btn: elements.tabAuthors, view: elements.viewAuthors, name: 'authors' },
    { btn: elements.tabApiDocs, view: elements.viewApiDocs, name: 'api-docs' },
  ];

  tabs.forEach(t => {
    t.btn.addEventListener('click', () => {
      tabs.forEach(o => {
        o.btn.classList.toggle('active', o.name === t.name);
        o.view.classList.toggle('active', o.name === t.name);
      });
      state.currentView = t.name;
    });
  });

  if (elements.footerApiLink) {
    elements.footerApiLink.addEventListener('click', (e) => {
      e.preventDefault();
      elements.tabApiDocs.click();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
  }

  // Add Book Button
  elements.openAddBookBtn.addEventListener('click', openAddModal);

  // Close modals
  elements.modalCloseBtn.addEventListener('click', () => elements.bookModal.style.display = 'none');
  elements.modalCancelBtn.addEventListener('click', () => elements.bookModal.style.display = 'none');
  elements.detailsCloseBtn.addEventListener('click', () => elements.detailsModal.style.display = 'none');
  elements.detailsDoneBtn.addEventListener('click', () => elements.detailsModal.style.display = 'none');

  // Close modals on clicking overlay outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.bookModal) elements.bookModal.style.display = 'none';
    if (e.target === elements.detailsModal) elements.detailsModal.style.display = 'none';
  });

  // Modal Form Submission (Create or Update)
  elements.bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = elements.formBookId.value;
    const payload = {
      title: elements.formTitle.value.trim(),
      author: elements.formAuthor.value.trim(),
      genre: elements.formGenre.value.trim() || 'General',
      year: elements.formYear.value ? parseInt(elements.formYear.value) : null,
      rating: elements.formRating.value ? parseFloat(elements.formRating.value) : 4.0,
      pages: elements.formPages.value ? parseInt(elements.formPages.value) : null,
      isbn: elements.formIsbn.value.trim(),
      status: elements.formStatus.value,
      description: elements.formDescription.value.trim()
    };

    try {
      if (bookId) {
        await api.updateBook(bookId, payload);
        showToast(`Book "${payload.title}" (ID: #${bookId}) updated successfully!`);
      } else {
        const created = await api.createBook(payload);
        showToast(`Book "${payload.title}" created with ID: #${created.data.id}!`);
      }
      elements.bookModal.style.display = 'none';
      await reloadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Live Search with Debounce
  let searchTimeout = null;
  elements.searchInput.addEventListener('input', () => {
    state.searchQuery = elements.searchInput.value.trim();
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      reloadAllData();
    }, 250);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    reloadAllData();
  });

  // Filter & Sort
  elements.genreFilter.addEventListener('change', () => {
    state.selectedGenre = elements.genreFilter.value;
    reloadAllData();
  });

  elements.sortSelect.addEventListener('change', () => {
    state.sortBy = elements.sortSelect.value;
    reloadAllData();
  });

  // Clear Filters
  elements.btnClearFilters.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.genreFilter.value = '';
    elements.sortSelect.value = 'id-asc';
    state.searchQuery = '';
    state.selectedGenre = '';
    state.sortBy = 'id-asc';
    elements.clearSearchBtn.style.display = 'none';
    reloadAllData();
  });

  // Layout View Switcher (Grid vs Table)
  elements.btnGridView.addEventListener('click', () => {
    state.layoutView = 'grid';
    elements.btnGridView.classList.add('active');
    elements.btnTableView.classList.remove('active');
    renderBooksGrid(state.books);
  });

  elements.btnTableView.addEventListener('click', () => {
    state.layoutView = 'table';
    elements.btnTableView.classList.add('active');
    elements.btnGridView.classList.remove('active');
    renderBooksGrid(state.books);
  });

  // Reset Database
  elements.btnResetDb.addEventListener('click', async () => {
    if (confirm('Reset database back to default sample books?')) {
      try {
        await api.resetData();
        showToast('Database reset to original 10 sample books!');
        await reloadAllData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  // Theme Toggle (Dark / Light)
  const savedTheme = localStorage.getItem('bookverse_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  elements.themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('bookverse_theme', nextTheme);
    updateThemeIcons(nextTheme);
  });

  setupApiConsole();
}

function updateThemeIcons(theme) {
  const darkIcon = document.querySelector('.theme-icon-dark');
  const lightIcon = document.querySelector('.theme-icon-light');
  if (theme === 'dark') {
    darkIcon.style.display = 'inline';
    lightIcon.style.display = 'none';
  } else {
    darkIcon.style.display = 'none';
    lightIcon.style.display = 'inline';
  }
}

// App Launch
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  reloadAllData();
});
