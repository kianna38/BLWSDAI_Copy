import api from './api';  // Axios instance

// Axios functions for SalaryInfo API
export const salaryInfoApi = {
    // Fetch the latest salary info
    getLatestSalary: async () => {
        try {
            const response = await api.get('/salaryInfo/salary/latest');
            return response.data; // Return the latest salary data
        } catch (error) {
            console.error("Error fetching the latest salary:", error);
            throw error;
        }
    },

    // Fetch all salary history
    getSalaryHistory: async () => {
        try {
            const response = await api.get('/salaryInfo/salary/history');
            return response.data; // Return the list of salary history
        } catch (error) {
            console.error("Error fetching salary history:", error);
            throw error;
        }
    },

    // Create or update salary info for the current month
    createOrUpdateSalary: async (salaryData) => {
        console.log(salaryData);
        try {
            const response = await api.post('/salaryInfo/salary/update', salaryData);
            return response.data; // Return the updated or created salary info
        } catch (error) {
            console.error("Error creating/updating salary:", error);
            throw error;
        }
    }
};
