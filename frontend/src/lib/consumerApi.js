import api from './api';  // Axios instance

// Axios functions for Consumer API
export const consumerApi = {
    // Fetch all consumers with pagination
    getAllConsumers: async (page = 1, pageSize = 20) => {
        try {
            const response = await api.get('/consumers', {
                params: { page, pageSize },
            });
            return response.data;  // Return the list of consumers
        } catch (error) {
            console.error("Error fetching all consumers:", error);
            throw error;
        }
    },

    // Fetch consumer by ID
    getConsumerById: async (id) => {
        try {
            const response = await api.get(`/consumers/${id}`);
            return response.data;  // Return the consumer details
        } catch (error) {
            console.error(`Error fetching consumer with id ${id}:`, error);
            throw error;
        }
    },

    // Create a new consumer
    createConsumer: async (consumerData) => {
        console.log(consumerData);
        try {
            const response = await api.post('/consumers', consumerData);
            return response.data;  // Return the newly created consumer data
        } catch (error) {
            console.error("Error creating consumer:", error);
            throw error;
        }
    },

    // Update an existing consumer
    updateConsumer: async (id, consumerData) => {
        try {
            const response = await api.put(`/consumers/${id}`, consumerData);
            return response.data;  // Return the updated consumer data
        } catch (error) {
            console.error(`Error updating consumer with id ${id}:`, error);
            throw error;
        }
    },

    // Delete a consumer by ID
    deleteConsumer: async (id) => {
        try {
            const response = await api.delete(`/consumers/${id}`);
            return response.data;  // Return success response
        } catch (error) {
            console.error(`Error deleting consumer with id ${id}:`, error);
            throw error;
        }
    },

    // Filter consumers based on certain conditions
    filterConsumers: async (filter) => {
        try { 
            const response = await api.post('/consumers/filter', filter);
            return response.data;  // Return filtered consumer list
        } catch (error) {
            console.error("Error filtering consumers:", error);
            throw error;
        }
    },

    // Filter consumers based on certain conditions
    filterConsumerBills: async (filter) => {
        try {
            const response = await api.post('/consumers/filter-bills', filter);
            return response.data;  // Return filtered consumer list
        } catch (error) {
            console.error("Error filtering consumers:", error);
            throw error;
        }
    }
};
