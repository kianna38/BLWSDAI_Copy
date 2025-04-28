import api from './api';  // Axios instance

// Fetch Income Report based on start and end dates
export const getIncomeReport = async (startMonth, endMonth) => {
    try {
        console.log('Fetching income report for:', startMonth, endMonth);

        const { data } = await api.get(
            `/reports/income-report?startMonth=${startMonth}&endMonth=${endMonth}`
        );

        console.log('Fetched income report data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching income report:', error.response?.data || error.message);
        throw error; //  Always rethrow so React Query knows it failed
    }
};



// Fetch General Disconnection Report based on month
export const getGeneralDisconnectionReport = async (month) => {
    const { data } = await api.get('/reports/disconnection-report', {
        params: {
            month,
        },
    });
    return data;
};


// Fetch Individual Disconnection Report for a specific consumer
export const getIndividualDisconnectionReport = async (consumerId) => {
    const { data } = await api.get(`/reports/disconnection-report/consumer/${consumerId}`);
    return data;
};


// send notice
export const notifyDisconnection = async (consumerId) => {
    const { data } = await api.post(`/reports/send-disconnection-notice/${consumerId}`);
    return data;
};


