import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOtherExpenses, getOtherExpenseById, createOtherExpense, updateOtherExpense, deleteOtherExpense, filterOtherExpenses } from '@/lib/otherExpensesApi'; // Importing the API functions
import { toast } from 'react-hot-toast';

// Hook to fetch all other expenses
export const useOtherExpenses = () => {
    const getAllExpenses = useQuery({
        queryKey: ['otherExpenses'], // Cache the data with the query key 'otherExpenses'
        queryFn: getAllOtherExpenses, // Fetch the other expenses from the API
        staleTime: 5 * 60 * 1000, // Cache the data for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache time for 10 minutes
    });
    return { getAllExpenses }; // Return the query object to allow destructuring
};

// Hook to fetch a single other expense by ID
export const useGetOtherExpenseById = (id) => {
    const getExpense = useQuery({
        queryKey: ['otherExpense', id], // Cache the data with the query key 'otherExpense'
        queryFn: () => getOtherExpenseById(id), // Fetch the other expense by ID
        enabled: !!id, // Only run if the ID is available
    });
    return { getExpense }; // Return the query object to allow destructuring
};

// Hook to create a new other expense
export const useCreateOtherExpense = () => {
    const queryClient = useQueryClient();
    const createExpensesMutation = useMutation({
        mutationFn: createOtherExpense, // API function to create an expense
        onSuccess: () => {
            queryClient.invalidateQueries(['otherExpenses']); // Invalidate the 'otherExpenses' query after creation
            toast.success('Expense created successfully!');
        },
        onError: (error) => {
            toast.error('Error creating expense!');
            //console.error('Error creating other expense:', error);
        },
    });
    return { createExpensesMutation }; // Return the mutation object to allow destructuring
};

// Hook to update an existing other expense
export const useUpdateOtherExpense = () => {
    const queryClient = useQueryClient();
    const updateExpensesMutation = useMutation({
        mutationFn: ({ id, updatedData }) => updateOtherExpense(id, updatedData), // Update the expense
        onSuccess: () => {
            queryClient.invalidateQueries(['otherExpenses']); // Invalidate the 'otherExpenses' query after updating
            queryClient.invalidateQueries(['otherExpense']); // Invalidate the single expense query
            toast.success('Expense updated successfully!');
        },
        onError: (error) => {
            toast.error('Error updating expense!');
            //console.error('Error updating other expense:', error);
        },
    });
    return { updateExpensesMutation }; // Return the mutation object to allow destructuring
};

// Hook to delete an other expense
export const useDeleteOtherExpense = () => {
    const queryClient = useQueryClient();
    const deleteExpensesMutation = useMutation({
        mutationFn: deleteOtherExpense, // API function to delete an expense
        onSuccess: () => {
            queryClient.invalidateQueries(['otherExpenses']); // Invalidate the 'otherExpenses' query after deletion
            toast.success('Expense deleted successfully!');
        },
        onError: (error) => {
            toast.error('Error deleting expense!');
            //console.error('Error deleting other expense:', error);
        },
    });
    return { deleteExpensesMutation }; // Return the mutation object to allow destructuring
};

// Hook to filter other expenses
export const useFilterOtherExpenses = () => {
    const getFilteredExpenses = useMutation({
        mutationFn: filterOtherExpenses, // Call the API function to filter other expenses
        onError: (error) => {
            toast.error('Error filtering expense!');
            //console.error('Error filtering other expenses:', error);
        },
    });
    return { getFilteredExpenses }; // Return the mutation object to allow destructuring
};


