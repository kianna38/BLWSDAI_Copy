import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/userApi'; // API functions
import { toast } from 'react-hot-toast';


export const useUsers = () => {
    const queryClient = useQueryClient();

    // Get All Users
    const getAllUsers = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
        staleTime: 5 * 60 * 1000,  // Cache users for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache time
    });

    return { getAllUsers };
};

// Get User by ID (Separate hook)
export const useUserById = (id) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => userApi.getById(id),
        enabled: !!id,  // Only run query if id is truthy
    });
};

// Create User
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    const createUserMutation = useMutation({
        mutationFn: userApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']); // Invalidate the users query after creation
            toast.success('User created successfully!');
        },
        onError: (error) => {
            toast.success('Error creating user!');
            //console.error('Error creating user:', error);
        },
    });

    return { createUserMutation };
};

// Update User
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const updateUserMutation = useMutation({
        mutationFn: ({ id, userData }) => userApi.updateUser(id, userData),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['user']); // Invalidate single user data if needed
            toast.success('User updated successfully!');
        },
        onError: (error) => {
            toast.success('Error updating user!');
            //console.error('Error updating user:', error);
        },
    });

    return { updateUser: updateUserMutation.mutate };
};

// Delete User
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    console.log('here');
    const deleteUserMutation = useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']); // Invalidate users list after deletion
            toast.success('User deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
            toast.success('Error deleting user!');
        },
    });

    return { deleteUserMutation };
};

// Filter Users
export const useFilterUsers = (filter) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['filteredUsers', filter],  // Cache key includes filter
        queryFn: () => userApi.filterUsers(filter),  // Fetch filtered users based on filter
        enabled: !!filter,  // Only run the query when filter is provided
    });

    return { data, isLoading, error };
};


export const useUserLogs = (userId, filter) => {
    return useQuery({
        queryKey: ['userLogs', userId, filter],  // Query key, including userId and filter as dependency
        queryFn: () => userApi.getUserLogs(userId, filter),  // Fetch logs using the userId and filter
        enabled: !!userId,  // Only run the query if userId is available
        retry: 1,  // Retry once in case of failure
        onError: (error) => {
            console.error('Error fetching user logs:', error);
        }
    });
};