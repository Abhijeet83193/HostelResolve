const API_BASE = `http://${window.location.hostname}:5000/api`;

// Helper for authenticated requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('hr_token');
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will do it with boundary
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ---- Auth Service ----
export const authService = {
    async login(email, password) {
        const data = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return data; // returns { success, user, token }
    },

    async register(userData) {
        const data = await fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return data;
    },

    async getProfile() {
        const data = await fetchWithAuth('/auth/profile');
        return data.user;
    },

    async updateProfile(userData) {
        const data = await fetchWithAuth('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
        return data.user;
    },

    async forgotPassword(email) {
        const data = await fetchWithAuth('/auth/forgotpassword', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return data;
    },

    async resetPassword(token, password) {
        const data = await fetchWithAuth(`/auth/resetpassword/${token}`, {
            method: 'PUT',
            body: JSON.stringify({ password }),
        });
        return data;
    },
};

// ---- Complaint Service ----
export const complaintService = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
        if (filters.search) params.append('search', filters.search);

        const data = await fetchWithAuth(`/complaints?${params.toString()}`);

        // Transform backend data to match frontend expectations if necessary
        // Backend returns _id, frontend expects id
        return data.data.map(c => ({
            ...c,
            id: c._id // Mapping MongoDB _id to id for frontend
        }));
    },

    async getById(id) {
        const data = await fetchWithAuth(`/complaints/${id}`);
        const complaint = data.data;
        return {
            ...complaint,
            id: complaint._id
        };
    },

    async create(formData) {
        const data = await fetchWithAuth('/complaints', {
            method: 'POST',
            body: formData, // This is FormData with images
        });
        return data.data;
    },

    async update(id, updateData) {
        const body = updateData instanceof FormData ? updateData : JSON.stringify(updateData);
        const data = await fetchWithAuth(`/complaints/${id}`, {
            method: 'PUT',
            body: body,
        });
        return data.data;
    },

    async addComment(id, text) {
        const data = await fetchWithAuth(`/complaints/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
        return data.data;
    },

    async upvote(id) {
        const data = await fetchWithAuth(`/complaints/${id}/upvote`, {
            method: 'POST',
        });
        return data;
    },

    async delete(id) {
        const data = await fetchWithAuth(`/complaints/${id}`, {
            method: 'DELETE',
        });
        return data;
    },

    async getStats() {
        const data = await fetchWithAuth('/complaints/stats');
        return data.data;
    },
};

// ---- Categories & Constants ----
export const CATEGORIES = [
    'Plumbing',
    'Electrical',
    'Internet',
    'Infrastructure',
    'Mess',
    'Cleaning',
    'Security',
    'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export const HOSTELS = [
    'Hostel A',
    'Hostel B',
    'Hostel C',
    'Hostel D',
    'Girls Hostel 1',
    'Girls Hostel 2',
];

