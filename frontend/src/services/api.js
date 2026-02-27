// ============================================
// Mock API Service
// Replace with real API calls when backend is ready
// ============================================

const API_BASE = 'http://localhost:5000/api';

// Simulated delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---- Mock Data ----
const mockUsers = [
    {
        id: '1',
        name: 'Abhijeet Kumar',
        email: 'abhijeet@hostel.edu',
        role: 'student',
        hostel: 'Hostel A',
        room: 'A-204',
        phone: '9876543210',
        avatar: null,
    },
    {
        id: '2',
        name: 'Dr. Sharma',
        email: 'sharma@hostel.edu',
        role: 'warden',
        hostel: 'Hostel A',
        room: 'Office',
        phone: '9876543211',
        avatar: null,
    },
];

const mockComplaints = [
    {
        id: 'C001',
        title: 'Water Leakage in Bathroom',
        description: 'There is continuous water leakage from the bathroom ceiling pipe. The water is dripping on the floor creating a slippery surface which is dangerous.',
        category: 'Plumbing',
        priority: 'High',
        status: 'In Progress',
        hostel: 'Hostel A',
        room: 'A-204',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: { id: '2', name: 'Dr. Sharma' },
        createdAt: '2026-02-25T10:30:00Z',
        updatedAt: '2026-02-26T14:00:00Z',
        comments: [
            {
                id: 'cm1',
                user: { id: '2', name: 'Dr. Sharma', role: 'warden' },
                text: 'Plumber has been informed and will visit tomorrow morning.',
                createdAt: '2026-02-26T14:00:00Z',
            },
        ],
        images: [],
        upvotes: 5,
    },
    {
        id: 'C002',
        title: 'Broken Window in Common Room',
        description: 'The window glass in the common room on the 2nd floor is broken. Cold wind enters through it making the room unusable in the evening.',
        category: 'Infrastructure',
        priority: 'Medium',
        status: 'Pending',
        hostel: 'Hostel A',
        room: 'Common Room - 2F',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: null,
        createdAt: '2026-02-26T08:15:00Z',
        updatedAt: '2026-02-26T08:15:00Z',
        comments: [],
        images: [],
        upvotes: 12,
    },
    {
        id: 'C003',
        title: 'WiFi Not Working on 3rd Floor',
        description: 'The WiFi router on the 3rd floor has been down for 3 days. Students are unable to attend online classes and complete assignments.',
        category: 'Internet',
        priority: 'Urgent',
        status: 'Pending',
        hostel: 'Hostel A',
        room: '3rd Floor',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: null,
        createdAt: '2026-02-24T16:45:00Z',
        updatedAt: '2026-02-24T16:45:00Z',
        comments: [],
        images: [],
        upvotes: 28,
    },
    {
        id: 'C004',
        title: 'Mess Food Quality Issue',
        description: 'The quality of food served at dinner has declined significantly. Multiple students have reported stomach issues after eating.',
        category: 'Mess',
        priority: 'High',
        status: 'Resolved',
        hostel: 'Hostel A',
        room: 'Mess Hall',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: { id: '2', name: 'Dr. Sharma' },
        createdAt: '2026-02-20T19:00:00Z',
        updatedAt: '2026-02-22T11:30:00Z',
        comments: [
            {
                id: 'cm2',
                user: { id: '2', name: 'Dr. Sharma', role: 'warden' },
                text: 'Mess committee has been notified. New vendor inspection completed.',
                createdAt: '2026-02-21T10:00:00Z',
            },
            {
                id: 'cm3',
                user: { id: '2', name: 'Dr. Sharma', role: 'warden' },
                text: 'Issue has been resolved. New menu and quality measures implemented.',
                createdAt: '2026-02-22T11:30:00Z',
            },
        ],
        images: [],
        upvotes: 42,
    },
    {
        id: 'C005',
        title: 'Electrical Short Circuit in Room',
        description: 'There are sparks coming from the switchboard near the study desk. This is extremely dangerous and needs immediate attention.',
        category: 'Electrical',
        priority: 'Urgent',
        status: 'In Progress',
        hostel: 'Hostel A',
        room: 'A-312',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: { id: '2', name: 'Dr. Sharma' },
        createdAt: '2026-02-27T06:00:00Z',
        updatedAt: '2026-02-27T08:00:00Z',
        comments: [
            {
                id: 'cm4',
                user: { id: '2', name: 'Dr. Sharma', role: 'warden' },
                text: 'Emergency electrician dispatched. Please avoid using the switchboard until fixed.',
                createdAt: '2026-02-27T08:00:00Z',
            },
        ],
        images: [],
        upvotes: 8,
    },
    {
        id: 'C006',
        title: 'AC Not Cooling Properly',
        description: 'The air conditioner in room B-105 is running but not cooling. The room temperature remains high despite running the AC at 16 degrees.',
        category: 'Electrical',
        priority: 'Low',
        status: 'Rejected',
        hostel: 'Hostel A',
        room: 'B-105',
        createdBy: { id: '1', name: 'Abhijeet Kumar' },
        assignedTo: { id: '2', name: 'Dr. Sharma' },
        createdAt: '2026-02-18T12:00:00Z',
        updatedAt: '2026-02-19T09:00:00Z',
        comments: [
            {
                id: 'cm5',
                user: { id: '2', name: 'Dr. Sharma', role: 'warden' },
                text: 'AC maintenance is scheduled for next month as per the annual maintenance calendar. Please use fans in the meantime.',
                createdAt: '2026-02-19T09:00:00Z',
            },
        ],
        images: [],
        upvotes: 3,
    },
];

// ---- Auth Service ----
export const authService = {
    async login(email, password) {
        await delay(800);
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // In real app, validate password with backend
        const token = 'mock-jwt-token-' + user.id;
        return { user, token };
    },

    async register(userData) {
        await delay(1000);
        const newUser = {
            id: String(mockUsers.length + 1),
            ...userData,
            avatar: null,
        };
        mockUsers.push(newUser);
        const token = 'mock-jwt-token-' + newUser.id;
        return { user: newUser, token };
    },

    async getProfile() {
        await delay(500);
        return mockUsers[0]; // Return current logged-in user
    },

    async updateProfile(data) {
        await delay(600);
        Object.assign(mockUsers[0], data);
        return mockUsers[0];
    },
};

// ---- Complaint Service ----
export const complaintService = {
    async getAll(filters = {}) {
        await delay(600);
        let results = [...mockComplaints];

        if (filters.status && filters.status !== 'all') {
            results = results.filter(c => c.status === filters.status);
        }
        if (filters.category && filters.category !== 'all') {
            results = results.filter(c => c.category === filters.category);
        }
        if (filters.priority && filters.priority !== 'all') {
            results = results.filter(c => c.priority === filters.priority);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
            );
        }

        // Sort by date, newest first
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return results;
    },

    async getById(id) {
        await delay(400);
        const complaint = mockComplaints.find(c => c.id === id);
        if (!complaint) throw new Error('Complaint not found');
        return complaint;
    },

    async create(data) {
        await delay(800);
        const newComplaint = {
            id: 'C' + String(mockComplaints.length + 1).padStart(3, '0'),
            ...data,
            status: 'Pending',
            createdBy: { id: '1', name: 'Abhijeet Kumar' },
            assignedTo: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            images: [],
            upvotes: 0,
        };
        mockComplaints.unshift(newComplaint);
        return newComplaint;
    },

    async update(id, data) {
        await delay(600);
        const idx = mockComplaints.findIndex(c => c.id === id);
        if (idx === -1) throw new Error('Complaint not found');
        Object.assign(mockComplaints[idx], data, { updatedAt: new Date().toISOString() });
        return mockComplaints[idx];
    },

    async addComment(id, text) {
        await delay(500);
        const complaint = mockComplaints.find(c => c.id === id);
        if (!complaint) throw new Error('Complaint not found');
        const comment = {
            id: 'cm' + Date.now(),
            user: { id: '1', name: 'Abhijeet Kumar', role: 'student' },
            text,
            createdAt: new Date().toISOString(),
        };
        complaint.comments.push(comment);
        return comment;
    },

    async upvote(id) {
        await delay(300);
        const complaint = mockComplaints.find(c => c.id === id);
        if (!complaint) throw new Error('Complaint not found');
        complaint.upvotes += 1;
        return complaint;
    },

    async getStats() {
        await delay(400);
        return {
            total: mockComplaints.length,
            pending: mockComplaints.filter(c => c.status === 'Pending').length,
            inProgress: mockComplaints.filter(c => c.status === 'In Progress').length,
            resolved: mockComplaints.filter(c => c.status === 'Resolved').length,
            rejected: mockComplaints.filter(c => c.status === 'Rejected').length,
        };
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
