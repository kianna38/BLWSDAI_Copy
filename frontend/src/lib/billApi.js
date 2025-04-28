import api from './api';  // Assuming you have an Axios instance set up

// Bill API Functions

// Function to fetch all bills with filtering options
export const getAllBills = async (filterParams) => {
    console.log('filterParams');
    console.log(filterParams);
    try {
        const response = await api.post('/bills/filter', filterParams);
        return response.data;
    } catch (error) {
        console.error("Error fetching bills:", error);
        throw error;
    }
};

// Function to get bill details by ID
export const getBillById = async (billId) => {
    try {
        const response = await api.get(`/bills/${billId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching bill by ID:", error);
        throw error;
    }
};

// Fetch readings by month and year
export const getBillsByMonthYear = async (monthYear, page = 1, pageSize = 20) => {
    try {
        const response = await api.get('/bills/monthYear', {
            params: {
                monthYear,
                page,
                pageSize
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching bills by month and year:', error);
        throw error;
    }
};

// Function to generate bills for a given month
export const generateBills = async (monthYear) => {
    console.log('Sending monthYear:', monthYear);

    try {
        const response = await api.post(`/bills/generate?monthYear=${encodeURIComponent(monthYear)}`);
        return response.data;
    } catch (error) {
        console.error("Error generating bills:", error.response?.data || error.message);
        throw error;
    }
};




// Function to delete a bill by ID
export const deleteBill = async (monthYear) => {
    try {
        await api.delete(`/bills/monthYear`, {
            params: { monthYear } //  send it as query parameter
        });
    } catch (error) {
        console.error("Error deleting bill:", error);
        throw error;
    }
};
