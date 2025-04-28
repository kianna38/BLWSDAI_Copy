import api from './api'; // Assuming you have an API utility

// API function to fetch all other expenses
export const getAllOtherExpenses = async () => {
    const response = await api.get('/otherexpenses');
    return response.data;
};

// API function to fetch a single other expense by ID
export const getOtherExpenseById = async (id) => {
    const response = await api.get(`/otherexpenses/${id}`);
    return response.data;
};

// API function to create a new other expense
export const createOtherExpense = async (expenseData) => {
    const response = await api.post('/otherexpenses', expenseData);
    return response.data;
};

// API function to update an existing other expense
export const updateOtherExpense = async (id, expenseData) => {

    console.log(`/otherexpenses/${id}`, expenseData);
    const response = await api.put(`/otherexpenses/${id}`, expenseData);
    return response.data;
};

// API function to delete an other expense by ID
export const deleteOtherExpense = async (id) => {
    const response = await api.delete(`/otherexpenses/${id}`);
    return response.data;
};

// API function to filter other expenses
export const filterOtherExpenses = async (filterData) => {
    const response = await api.post('/otherexpenses/filter', filterData);
    return response.data;
};
