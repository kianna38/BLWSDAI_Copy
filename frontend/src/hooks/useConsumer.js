import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consumerApi } from '@/lib/consumerApi';  // Import the API functions

// Hook to fetch all consumers with pagination
export const useConsumers = (page = 1, pageSize = 20) => {
    const getAllConsumers = useQuery({
        queryKey: ['consumers', page, pageSize],  // Cache the data with the query key
        queryFn: () => consumerApi.getAllConsumers(page, pageSize),  // Fetch the consumers
        keepPreviousData: true,  // Keep old data while new data is loading
    });

    return { getAllConsumers };  // Return as an object
};

// Hook to fetch a consumer by ID
export const useConsumerById = (id) => {
    const getConsumer = useQuery({
        queryKey: ['consumer', id],  // Cache the data with the query key
        queryFn: () => consumerApi.getConsumerById(id),  // Fetch the consumer by ID
        enabled: !!id,  // Only run the query if ID is available
    });

    return { getConsumer };  // Return as an object
};

// Hook to create a new consumer
export const useCreateConsumer = () => {
    const queryClient = useQueryClient();

    const createConsumerMutation = useMutation({
        mutationFn: consumerApi.createConsumer,  // Call the API to create a new consumer
        onSuccess: () => {
            queryClient.invalidateQueries(['consumers']);  // Invalidate queries related to consumers
        },
        onError: (error) => {
            alert('Duplicate Email or Meter Number.');
            console.error('Error creating consumer:', error);
        },
    });

    return { createConsumerMutation };  // Return as an object
};

// Hook to update a consumer
export const useUpdateConsumer = () => {
    const queryClient = useQueryClient();

    const updateConsumerMutation = useMutation({
        mutationFn: ({ id, consumerData }) => consumerApi.updateConsumer(id, consumerData),  // Call the API to update the consumer
        onSuccess: () => {
            queryClient.invalidateQueries(['consumers']);
            queryClient.invalidateQueries(['consumer']);  // Invalidate the cache for the updated consumer
        },
        onError: (error) => {
            alert('Duplicate Email or Meter Number.');
            console.error('Error updating consumer:', error);
        },
    });

    return { updateConsumerMutation };  // Return as an object
};

// Hook to delete a consumer
export const useDeleteConsumer = () => {
    const queryClient = useQueryClient();

    const deleteConsumerMutation = useMutation({
        mutationFn: (id) => consumerApi.deleteConsumer(id),  // Call the API to delete a consumer
        onSuccess: () => {
            queryClient.invalidateQueries(['consumers']);  // Invalidate the consumers cache after deletion
        },
        onError: (error) => {
            console.error('Error deleting consumer:', error);
        },
    });

    return { deleteConsumerMutation };  // Return as an object
};

// Hook to filter consumers based on filter criteria
export const useFilterConsumers = (filter) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['filteredConsumers', filter],  // Cache key includes filter
        queryFn: () => consumerApi.filterConsumers(filter),  // Pass the filter to the API function
        enabled: !!filter,  // Only run the query when filter is provided
    });

    //Input: public class ConsumerFilterDto {
    //    public List<PurokEnum>? Puroks { get; set; }
    //    public List < ConsumerStatusEnum >? Statuses { get; set; }
    //    public List < NotifPrefEnum >? NotifPreferences { get; set; }

    //    public string ? SortBy { get; set; } = "createdAt";
    //    public string SortDir { get; set; } = "asc";

    //    public int Page { get; set; } = 1;
    //    public int PageSize { get; set; } = 10;
    //}

    return { data, isLoading, error };  // Return as an object
};

// Hook to filter consumers based on filter criteria
export const useFilterConsumerBills = (filter) => {
    const filterConsumerBills = useQuery({
        queryKey: ['filteredConsumerBills', filter],  // Cache key includes filter
        queryFn: () => consumerApi.filterConsumerBills(filter),  // Pass the filter to the API function
        enabled: !!filter,  // Only run the query when filter is provided
    });

    return { filterConsumerBills };  // Return as an object
};

