import api from './api'; // Import your axios instance

// Axios functions for MotherMeter API
export const motherMeterApi = {

    // Get all Mother Meter readings
    getAll: async () => {
        try {
            const response = await api.get('/motherMeterReadings');
            return response.data;  // Return the data (list of all readings)
        } catch (error) {
            console.error("Error fetching all Mother Meter readings:", error);
            throw error;
        }
    },

    // Get a specific Mother Meter reading by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/motherMeterReadings/${id}`);
            return response.data;  // Return the single reading data
        } catch (error) {
            console.error(`Error fetching Mother Meter reading with ID ${id}:`, error);
            throw error;
        }
    },

    // Get a Mother Meter reading by Month and Year
    getByMonthYear: async (monthYear) => {
        try {
            console.log(monthYear);
            const response = await api.get(`/motherMeterReadings/month-year`, {
                params: { monthYear }
            });
            return response.data;  // Return the reading data for that month
        } catch (error) {
            console.error(`Error fetching Mother Meter reading for ${monthYear}:`, error);
            throw error;
        }
    },

    // Create a new Mother Meter reading
    createUpdate: async (data) => {
        try {
            const response = await api.post('/motherMeterReadings', data);
            return response.data;  // Return the newly created reading data
        } catch (error) {
            console.error("Error creating Mother Meter reading:", error);
            throw error;
        }
    },



    // Get system loss data for a particular month
    getSystemLoss: async (monthYear) => {
        try {
            const response = await api.get('/motherMeterReadings/system-loss', {
                params: { monthYear }
            });
            return response.data;  // Return the system loss data
        } catch (error) {
            console.error(`Error fetching system loss data for ${monthYear}:`, error);
            throw error;
        }
    }
};
