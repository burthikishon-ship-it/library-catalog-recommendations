const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  // Books
  async getBooks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${API_BASE}/books?${query.toString()}`);
    return handleResponse(res);
  },

  async getBookById(id) {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return handleResponse(res);
  },

  async getGenres() {
    const res = await fetch(`${API_BASE}/books/genres`);
    return handleResponse(res);
  },

  async getFeaturedBooks() {
    const res = await fetch(`${API_BASE}/books/featured`);
    return handleResponse(res);
  },

  async createBook(bookData) {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    return handleResponse(res);
  },

  async updateBook(id, bookData) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    return handleResponse(res);
  },

  async deleteBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Borrowing
  async borrowBook(bookId, durationDays = 14) {
    const res = await fetch(`${API_BASE}/borrows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, durationDays }),
    });
    return handleResponse(res);
  },

  async returnBook(borrowId) {
    const res = await fetch(`${API_BASE}/borrows/${borrowId}/return`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMyBorrows(status = 'all') {
    const res = await fetch(`${API_BASE}/borrows/my?status=${status}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAllBorrows(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/borrows?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reviews & Ratings
  async addReview(reviewData) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(res);
  },

  async getBookReviews(bookId) {
    const res = await fetch(`${API_BASE}/reviews/book/${bookId}`);
    return handleResponse(res);
  },

  async deleteReview(id) {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Recommendations
  async getRecommendations(limit = 8) {
    const res = await fetch(`${API_BASE}/recommendations?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getSimilarBooks(bookId, limit = 5) {
    const res = await fetch(`${API_BASE}/recommendations/similar/${bookId}?limit=${limit}`);
    return handleResponse(res);
  },

  async getRecommendationsByGenre() {
    const res = await fetch(`${API_BASE}/recommendations/by-genre`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },
};
