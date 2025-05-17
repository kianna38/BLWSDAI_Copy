import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motherMeterApi } from '@/lib/motherMeterApi';  // Import the API functions
import { toast } from 'react-hot-toast';


// Hook to fetch all Mother Meter readings
export const useMotherMeterReadings = () => {
    const readingsQuery = useQuery({
        queryKey: ['motherMeterReadings'], // Query key to cache and track data
        queryFn: motherMeterApi.getAll, // Fetch data using the API
    });

    return { readingsQuery };  // Return the query result as an object
};

// Hook to fetch a single Mother Meter reading by ID
export const useMotherMeterReading = (id) => {
    const readingQuery = useQuery({
        queryKey: ['motherMeterReading', id], // Query key to fetch data by ID
        queryFn: () => motherMeterApi.getById(id), // Fetch the data by ID
        enabled: !!id, // Only fetch if the ID is available
    });

    return { readingQuery };  // Return the query result as an object
};

// Hook to fetch Mother Meter reading by Month and Year
export const useMotherMeterReadingByMonthYear = (monthYear) => {
    const readingQuery = useQuery({
        queryKey: ['motherMeterReading', monthYear], // Query key with monthYear
        queryFn: () => motherMeterApi.getByMonthYear(monthYear), // Fetch based on monthYear
        enabled: !!monthYear, // Only fetch if monthYear is available
    });


    return { readingQuery };  // Return the query result as an object
};

// Hook to create a new Mother Meter reading
export const useCreateUpdateMotherMeterReading = () => {
    const queryClient = useQueryClient();

    const createUpdateReadingMutation = useMutation({
        mutationFn: motherMeterApi.createUpdate, // API function to create a new reading
        onSuccess: () => {
            // Invalidate relevant queries to refetch data
            queryClient.invalidateQueries(['motherMeterReadings']);
            toast.success('Mother Meter Reading for next month created successfully!');
        },
        onError: (error) => {
            toast.error('Error creating Mother Meter reading!');
            //console.error('Error creating Mother Meter reading:', error);
        }
    });


    return { createUpdateReadingMutation };  // Return the mutation result as an object
};

// Hook to update an existing Mother Meter reading
export const useUpdateMotherMeterReading = () => {
    const queryClient = useQueryClient();

    const updateReadingMutation = useMutation({
        mutationFn: ({ monthYear, data }) => motherMeterApi.update(monthYear, data), // Update the reading
        onSuccess: () => {
            // Invalidate relevant queries to refetch data
            queryClient.invalidateQueries(['motherMeterReadings']);
            queryClient.invalidateQueries(['motherMeterReading', id]);
            toast.success('Mother Meter Reading updated successfully!');
        },
        onError: (error) => {
            toast.error('Error updating Mother Meter reading!');
            //console.error('Error updating Mother Meter reading:', error);
        }
    });

    return { updateReadingMutation };  // Return the mutation result as an object
};

// Hook to fetch the system loss for a given month and year
export const useSystemLoss = (monthYear) => {
    const systemLossQuery = useQuery({
        queryKey: ['systemLoss', monthYear], // Query key to fetch system loss data
        queryFn: () => motherMeterApi.getSystemLoss(monthYear), // Fetch system loss data
        enabled: !!monthYear, // Only fetch if monthYear is available
    });

    return { systemLossQuery };  // Return the query result as an object
};
