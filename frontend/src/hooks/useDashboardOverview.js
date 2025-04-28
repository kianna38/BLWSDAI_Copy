import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDashboardOverview = (currentYear, comparisonYear) => {
    return useQuery({
        queryKey: ['dashboardOverview', currentYear, comparisonYear],
        queryFn: async () => {
            const { data } = await api.get('/Dashboard/overview', {
                params: { currentYear, comparisonYear },
            });
            return data;
        },
        staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    });
};
