import api from './api';  // Assuming you have an Axios instance set up

// Reading API Functions

// Fetch all readings
export const getAllReadings = async () => {
    try {
        const response = await api.get('/readings');
        return response.data;
    } catch (error) {
        console.error('Error fetching readings:', error);
        throw error;
    }
};

// Fetch a single reading by ID
export const getReadingById = async (readingId) => {
    try {
        const response = await api.get(`/readings/${readingId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reading by ID:', error);
        throw error;
    }
};

// Fetch readings by month and year
export const getReadingsByMonthYear = async (monthYear, page = 1, pageSize = 20) => {
    try {
        const response = await api.get('/readings/monthYear', {
            params: {
                monthYear,
                page,
                pageSize
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching readings by month and year:', error);
        throw error;
    }
};

// Create a new reading
export const createReading = async (newReadingData) => {
    try {
        const response = await api.post('/readings', newReadingData);
        return response.data;
    } catch (error) {
        console.error('Error creating reading:', error);
        throw error;
    }
};

// Update an existing reading
export const updateReading = async (readingId, updatedReadingData) => {
    try {
        const response = await api.put(`/readings/${readingId}`, updatedReadingData);
        return response.data;
    } catch (error) {
        console.error('Error updating reading:', error);
        throw error;
    }
};

// Delete a reading by ID
export const deleteReading = async (readingId) => {
    try {
        await api.delete(`/readings/${readingId}`);
    } catch (error) {
        console.error('Error deleting reading:', error);
        throw error;
    }
};

// Get summary of readings (sum of present and previous readings)
export const getReadingSummary = async (monthYear) => {
    try {
        const response = await api.get('/readings/month-year/summary', {
            params: {
                monthYear
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reading summary:', error);
        throw error;
    }
};
