import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBills, getBillById, generateBills, deleteBill, getBillsByMonthYear } from '@/lib/billApi'; // Import the API functions
import { toast } from 'react-hot-toast';

// Hook to fetch all bills with filtering options
export const useBills = (filterParams) => {
    const getBills = useQuery({
        queryKey: ['bills', filterParams],  // Query key for bills with filtering parameters
        queryFn: () => getAllBills(filterParams),  // Fetch data using the API
        enabled: !!filterParams,  // Only fetch if filterParams are provided
    });


    return { getBills }; // Return the query result as an object
};

// Hook to fetch a single bill by ID
export const useBillById = (billId) => {
    const getBill = useQuery({
        queryKey: ['bill', billId],  // Query key for fetching a specific bill by ID
        queryFn: () => getBillById(billId), // Fetch data using the API
        enabled: !!billId,  // Only fetch if billId is available
    });

    return { getBill };  // Return the query result as an object
};

// Hook to fetch readings by month and year
export const useBillsByMonthYear = (monthYear, page = 1, pageSize = 20) => {
    const getMonthBills = useQuery({
        queryKey: ['monthBills', monthYear, page, pageSize], // Ensure these are tracked as separate query keys
        queryFn: () => getBillsByMonthYear(monthYear, page, pageSize), // API call with page and pageSize
        enabled: !!monthYear,  // Only run if monthYear is provided
    });

    return { getMonthBills };
};

// Hook to generate bills for a given month
export const useGenerateBills = () => {
    const queryClient = useQueryClient();

    const generateBillsMutation = useMutation({
        mutationFn: generateBills,  // Call the API function to generate bills
        onSuccess: () => {
            toast.success('Bills generated successfully!');
            queryClient.invalidateQueries(['MonthBills']);  // Invalidate the bills cache after successful generation
        },
        onError: (error) => {
            toast.error('Error generating bill!');
            console.error('Error generating bills:', error);
        },
    });

    return { generateBillsMutation };  // Return the mutation result as an object
};

// Hook to delete a bill by ID
export const useDeleteBill = () => {
    const queryClient = useQueryClient();

    const deleteBillsMutation = useMutation({
        mutationFn: deleteBill,  // Call the API function to delete a bill
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);  // Invalidate the bills cache after deletion
            toast.success('Bills deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting bill:', error);
            toast.error('Error deleting bills. Make sure that none of the bills for this month are already paid.');
        },
    });

    return { deleteBillsMutation };  // Return the mutation result as an object
};
