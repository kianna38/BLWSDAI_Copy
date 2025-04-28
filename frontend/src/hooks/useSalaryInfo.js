import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryInfoApi } from '@/lib/salaryInfoApi'; // Import the salary API functions

// Hook to fetch the latest salary info
export const useLatestSalary = () => {
    const latestSalaryQuery = useQuery({
        queryKey: ['latestSalary'],  // Cache the data with the query key 'latestSalary'
        queryFn: salaryInfoApi.getLatestSalary,  // Fetch the latest salary info from the API
        enabled: true, // Always run this query
    });

    return { latestSalaryQuery };
};

// Hook to fetch all salary history
export const useSalaryHistory = () => {
    const salaryHistoryQuery = useQuery({
        queryKey: ['salaryHistory'],  // Cache the data with the query key 'salaryHistory'
        queryFn: salaryInfoApi.getSalaryHistory,  // Fetch the salary history from the API
        enabled: true, // Always run this query
    });

    return { salaryHistoryQuery };
};

// Hook to create or update salary info
export const useCreateOrUpdateSalary = () => {
    const queryClient = useQueryClient(); // React Query client

    const createOrUpdateSalaryMutation = useMutation({
        mutationFn: salaryInfoApi.createOrUpdateSalary,  // Call the API to create or update salary info
        onSuccess: () => {
            // Invalidate the queries to refetch salary data after mutation
            queryClient.invalidateQueries(['latestSalary']);
            queryClient.invalidateQueries(['salaryHistory']);
        },
        onError: (error) => {
            console.error('Error creating/updating salary info:', error);
        },
    });

    return { createOrUpdateSalaryMutation };
};


//// Fetch the latest salary info
//const { data: latestSalary, isLoading: loadingLatest } = useLatestSalary().latestSalaryQuery;

//// Fetch the salary history
//const { data: salaryHistory, isLoading: loadingHistory } = useSalaryHistory().salaryHistoryQuery;

//// Mutation for creating or updating salary info
//const { mutate: updateSalary, isLoading: saving } = useCreateOrUpdateSalary().createOrUpdateSalaryMutation;
