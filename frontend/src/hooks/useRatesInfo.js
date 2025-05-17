import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRates, updateRates } from '@/lib/ratesInfoApi'; // Importing the API functions
import { toast } from 'react-hot-toast';


// Hook to fetch the latest rates information
export const useRatesInfo = () => {
    const getRatesInfo = useQuery({
        queryKey: ['ratesInfo'],  // Cache the data with the query key 'ratesInfo'
        queryFn: getRates,  // Fetch the rates info from the API
    });
    return { getRatesInfo }; // Return the query object to allow destructuring
};

// Hook to update rates information
export const useUpdateRatesInfo = () => {
    const queryClient = useQueryClient();
    const updateRatesInfo = useMutation({
        mutationFn: updateRates, // API function to update rates info
        onSuccess: () => {
            queryClient.invalidateQueries(['ratesInfo']); // Invalidate the 'ratesInfo' query after updating
            toast.success('Rates Information updated successfully!');
        },
        onError: (error) => {
            toast.success('Error updating rates information!');
            //console.error('Error updating rates info:', error);
        },
    });
    return { updateRatesInfo }; // Return the mutation object to allow destructuring
};
