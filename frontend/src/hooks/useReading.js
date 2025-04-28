import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllReadings, getReadingById, getReadingsByMonthYear, createReading, updateReading, deleteReading, getReadingSummary   } from '@/lib/readingApi'; // Import the API functions

// Hook to fetch all readings
export const useReadings = () => {
    const getAllReadings = useQuery({
        queryKey: ['readings'],
        queryFn: readingApi.getAllReadings,
    });

    return { getAllReadings };
};

// Hook to fetch a single reading by ID
export const useReadingById = (readingId) => {
    const getReading = useQuery({
        queryKey: ['reading', readingId],
        queryFn: () => getReadingById(readingId),
        enabled: !!readingId,  // Only run if readingId is provided
    });

    return { getReading };
};

// Hook to fetch readings by month and year
export const useReadingsByMonthYear = (monthYear, page = 1, pageSize = 20) => {
    const getFilteredReading = useQuery({
        queryKey: ['readings', monthYear, page, pageSize], // Ensure these are tracked as separate query keys
        queryFn: () => getReadingsByMonthYear(monthYear, page, pageSize), // API call with page and pageSize
        enabled: !!monthYear,  // Only run if monthYear is provided
    });

    return { getFilteredReading };
};

// Hook to create a new reading
export const useCreateReading = () => {
    const queryClient = useQueryClient();

    const createReadingMutation = useMutation({
        mutationFn: createReading, // Call the API function to create a new reading
        onSuccess: () => {
            // Invalidate relevant queries to refetch data after creating a reading
            queryClient.invalidateQueries(['readings']);
        },
        onError: (error) => {
            console.error('Error creating reading:', error);
        }
    });


    return { createReadingMutation };
};

// Hook to update an existing reading
export const useUpdateReading = () => {
    const queryClient = useQueryClient();

    const updateReadingMutation = useMutation({
        mutationFn: ({ readingId, updatedReadingData }) => updateReading(readingId, updatedReadingData),
        onSuccess: (data, variables) => {
            const { readingId } = variables;  //  get it from variables
            queryClient.invalidateQueries(['readings']);
            queryClient.invalidateQueries(['reading', readingId]);
        },
        onError: (error) => {
            console.error('Error updating reading:', error);
        }
    });

    return { updateReadingMutation };
};



// Hook to fetch summary of readings (sum of present and previous readings)
export const useReadingSummary = (monthYear) => {
    const readingSummaryQuery = useQuery({
        queryKey: ['readingSummary', monthYear],  // Query key for reading summary
        queryFn: () => getReadingSummary(monthYear),
        enabled: !!monthYear,  // Only run if monthYear is provided
    });

    //return: public class ReadingSummaryDto {
    //    public bool billGenerated { get; set; }
    //    public int numOfActiveConsumers { get; set; }
    //    public int numOfReadings { get; set; }
    //    public decimal SumOfPresentReading { get; set; }
    //    public decimal SumOfPreviousReading { get; set; }
    //    public decimal TotalConsumerReading => SumOfPresentReading - SumOfPreviousReading;
    //}

    return { readingSummaryQuery };
};
