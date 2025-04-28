import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getIncomeReport, getGeneralDisconnectionReport, getIndividualDisconnectionReport, notifyDisconnection } from '@/lib/reportSummaryApi'; // Importing the API functions

// Hook to fetch Income Report
export const useIncomeReport = (startMonth, endMonth) => {
    return useQuery({
        queryKey: ['incomeReport', startMonth, endMonth],
        queryFn: () => getIncomeReport(startMonth, endMonth),
        enabled: !!startMonth && !!endMonth, // Run the query only if both startMonth and endMonth are provided
    });
};

// Hook to fetch General Disconnection Report
export const useGeneralDisconnectionReport = (month) => {
    return useQuery({
        queryKey: ['generalDisconnectionReport', month],
        queryFn: () => getGeneralDisconnectionReport(month),
        enabled: !!month, // Only fetch if the month is provided
    });
};

// Hook to fetch Individual Disconnection Report
export const useIndividualDisconnectionReport = (consumerId) => {
    return useQuery({
        queryKey: ['individualDisconnectionReport', consumerId],
        queryFn: () => getIndividualDisconnectionReport(consumerId),
        enabled: !!consumerId, // Only run the query if the consumerId is available
    });
};

// Hook to create a new other expense
// Hook to notify a consumer for disconnection
export const notifyIndvDisconnection = () => {
    const queryClient = useQueryClient();
    const notifyDisconnectionMutation = useMutation({
        mutationFn: notifyDisconnection,
        onSuccess: () => {
            alert("Successfully Notified Consumer.");
        },
        onError: (error) => {
            console.error('Error notifying consumer:', error);
            alert('Failed to notify consumer. Please try again.');
        },
    });
    return { notifyDisconnectionMutation };
};



//const { data: incomeReport, isLoading, error } = useIncomeReport(startDate, endDate);
//const { data: generalDisconnectionReport, isLoading, error } = useGeneralDisconnectionReport(month);
//const { data: individualDisconnectionReport, isLoading, error } = useIndividualDisconnectionReport(consumerId);
