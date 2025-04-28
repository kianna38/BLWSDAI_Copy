import api from './api';  // Axios instance


// Fetch all payments
export const getAllPayments = async (page = 1, pageSize = 20) => {
    const { data } = await api.get('/payments/', { params: { page, pageSize } });
    return data;
};

// Fetch payment by ID
export const getPaymentById = async (id) => {
    const { data } = await api.get(`/payments/${id}`);
    return data;
};

// Create a new payment
export const createPayment = async (paymentData) => {
    const { data } = await api.post('/payments/', paymentData);
    return data;
};

// Update an existing payment
export const updatePayment = async (id, paymentData) => {
    const { data } = await api.put(`/payments/${id}`, paymentData);
    return data;
};

// Delete a payment by ID
export const deletePayment = async (id) => {
    const { data } = await api.delete(`/payments/${id}`);
    return data;
};

// Filter payments based on provided filters
export const filterPayments = async (filters) => {
    const { data } = await api.post('/payments/filter', filters);
    return data;
};


