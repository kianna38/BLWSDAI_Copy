import api from './api';  // Axios instance

// Fetch the latest rates information
export const getRates = async () => {
    const { data } = await api.get('/ratesinfo/');
    return data;
};

// Update rates information
export const updateRates = async (ratesData) => {
    const { data } = await api.put('/ratesinfo/', ratesData);
    return data;
};


