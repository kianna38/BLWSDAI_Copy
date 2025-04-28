import api from './api';  // Axios instance

// Axios functions for user API
export const userApi = {
    login: async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            if (response.data && response.data.token) {
                return response.data; // Return token and user data
            }
            throw new Error('Login failed, no token received.');
        } catch (error) {
            console.error("Login error:", error);
            throw error;  // Re-throw error to be handled by the caller
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/users/logout');
            return response.data; // Response from the server (e.g., success message)
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    },

    getAll: async (page = 1, pageSize = 20) => {
        try {
            const response = await api.get('/users', { params: { page, pageSize } });
            return response.data;
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with id ${id}:`, error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            console.log(`userID on userApi: ${ id }`);
            console.log(`userData on userApi: ${id}`);
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error(`Error updating user with id ${id}:`, error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            console.log(id);
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting user with id ${id}:`, error);
            throw error;
        }
    },

    // Assuming this is inside userApi.js or your API functions file
    filterUsers: async (filter) => {
        try {
            console.log('Filtering users with', filter);
            const response = await api.post('/users/filter', filter);
            return response.data;  // Make sure the response is in the expected format
        } catch (error) {
            console.error("Error filtering users:", error);
            throw error;
        }
    },



    getUserLogs: async (userId, filter) => {
        try {
            console.log(userId);
            console.log(filter);
            const response = await api.post(`/users/${userId}/logs`, filter);
            return response.data; // Return logs data
        } catch (error) {
            console.error(`Error fetching logs for user ${userId}:`, error);
            throw error;
        }
    }
};
