import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state
import { userApi } from '@/lib/userApi'; // API functions
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


export const useAuth = () => {
    const { token, userId, userRole, setUser, clearUser } = useAuthStore(); // Access persisted state
    const router = useRouter();
    const queryClient = useQueryClient();

    // Create a ref to hold the cancel token so it doesn't persist across renders
    const cancelTokenRef = useRef(null);

    // Ensure client-side hydration and authentication check
    useEffect(() => {
        if (!token || !userId || !userRole) {
            router.push('/');
        }
    }, [token, userId, userRole, router]);

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }) => {
            cancelTokenRef.current = axios.CancelToken.source(); // Create a new cancel token for the request
            const data = await userApi.login(email, password, cancelTokenRef.current.token);

            setUser({
                token: data.token,
                userId: data.user.userId,
                userRole: data.user.role,
            });

            const user = await userApi.getById(data.user.userId);
            if (user) {
                queryClient.setQueryData(['user', data.user.userId], user);
                toast.success('Logged in successfully !');
                router.push('/dashboard');

            } else {
                toast.error('Login failed. User not found.');
                //console.error('User not found');
            }

            return data;
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
            //alert(error?.response?.data?.message || 'Login failed. Please try again.');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            // Cancel any ongoing API requests when the user logs out
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('User logged out, canceling ongoing requests.');
            }

            await userApi.logout();
            clearUser(); // Clear user state from Zustand store
            queryClient.invalidateQueries(['user']);
        },
        onSuccess: () => {
            toast.success('Logged out successfully');
            router.push('/');
            //console.log('Logged out successfully');
        },
        onError: (error) => {
            toast.error('Logout failed:', error);
            //console.error('Logout failed:', error);
        },
    });

    return {
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        loginLoading: loginMutation.isLoading,
        logoutLoading: logoutMutation.isLoading,
        loginError: loginMutation.isError,
        logoutError: logoutMutation.isError,
    };
};
