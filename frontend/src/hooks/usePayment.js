import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment, filterPayments  } from '@/lib/paymentApi'; // Import the payment API functions

// Hook to fetch all payments
export const usePayments = () => {
    const getAllPayments = useQuery({
        queryKey: ['payments'], // Cache the data with the query key 'payments'
        queryFn: getAllPayments, // Fetch the payments from the API
        staleTime: 5 * 60 * 1000,  // Cache the data for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache time for 10 minutes
    });
    return { getAllPayments }; // Return the query object to allow destructuring
};

// Hook to fetch a single payment by ID
export const usePaymentById = (id) => {
    const getPayment = useQuery({
        queryKey: ['payment', id], // Cache the data with the query key 'payment'
        queryFn: () => getPaymentById(id), // Fetch the payment by ID
        enabled: !!id, // Only run if the ID is available
    });
    return { getPayment }; // Return the query object to allow destructuring
};

// Hook to create a new payment
export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    const createPaymentMutation = useMutation({
        mutationFn: createPayment, // API function to create a new payment
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']); // Invalidate the 'payments' query after creation
        },
        onError: (error) => {
            console.error('Error creating payment:', error);
        },
    });
    return { createPaymentMutation }; // Return the mutation object to allow destructuring
};

// Hook to update an existing payment
export const useUpdatePayment = () => {
    const queryClient = useQueryClient();
    const updatePaymentMutation = useMutation({
        mutationFn: ({ id, updatedData }) => updatePayment(id, updatedData), // Update the payment
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']); // Invalidate the 'payments' query after updating
            queryClient.invalidateQueries(['payment', id]); // Invalidate the single payment query
        },
        onError: (error) => {
            console.error('Error updating payment:', error);
        },
    });
    return { updatePaymentMutationn }; // Return the mutation object to allow destructuring
};

// Hook to delete a payment by ID
export const useDeletePayment = () => {
    const queryClient = useQueryClient();
    const deletePaymentMutation = useMutation({
        mutationFn: deletePayment, // API function to delete a payment
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            queryClient.invalidateQueries(['payment']); // Invalidate the 'payments' query after deletion
        },
        onError: (error) => {
            console.error('Error deleting payment:', error);
        },
    });
    return { deletePaymentMutation }; // Return the mutation object to allow destructuring
};

// Hook to filter payments
export const useFilterPayments = (filterParams) => {
    const getFilteredPayments = useQuery({
        queryKey: ['payments', filterParams],  // Query key for bills with filtering parameters
        queryFn: () => filterPayments(filterParams),  // Fetch data using the API
        enabled: !!filterParams,  // Only fetch if filterParams are provided
    });
    return { getFilteredPayments }; // Return the mutation object to allow destructuring
};
