import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getIncomeReport, getGeneralDisconnectionReport, getIndividualDisconnectionReport, notifyDisconnection } from '@/lib/reportSummaryApi'; // Importing the API functions
import { useState } from 'react';

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
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    const notifyDisconnectionMutation = useMutation({
        mutationFn: notifyDisconnection,
        onSuccess: () => {
            setToastConfig({
                type: 'success',
                message: 'Successfully Notified Consumer.'
            });
            setIsToastOpen(true);
        },
        onError: (error) => {
            console.error('Error notifying consumer:', error);
            setToastConfig({
                type: 'error',
                message: 'Failed to notify consumer. Please try again.'
            });
            setIsToastOpen(true);
        },
    });

    return { 
        notifyDisconnectionMutation,
        isToastOpen,
        setIsToastOpen,
        toastConfig
    };
};



//const { data: incomeReport, isLoading, error } = useIncomeReport(startDate, endDate);
//const { data: generalDisconnectionReport, isLoading, error } = useGeneralDisconnectionReport(month);
//const { data: individualDisconnectionReport, isLoading, error } = useIndividualDisconnectionReport(consumerId);
