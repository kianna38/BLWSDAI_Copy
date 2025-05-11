import axios from 'axios';
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state

let baseURL = '';

if (typeof window !== 'undefined') {
    // Use environment variable in production, fallback to localhost in development
    baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5112/api';
}

// Create an Axios instance with configuration
const api = axios.create({
    baseURL,  // Replace with your actual API URL
    withCredentials: true, // To send cookies along with requests (if required)
    // Only use httpsAgent in development
    ...(process.env.NODE_ENV === 'development' && {
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    })
});

// Request Interceptor to add the token to headers
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token; // Access token from Zustand store

        if (token) {
            // Add Bearer token to Authorization header if available
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);  // Propagate the error
    }
);

// Response Interceptor for handling errors globally
api.interceptors.response.use(
    (response) => response,  // Simply return the response data
    (error) => {
        if (error.response) {
            // If the server responded with an error
            if (error.response.status === 401) {
                // Token is expired or unauthorized, handle it here
                console.error('Token expired or invalid, logging out...');
                useAuthStore.getState().clearUser(); // Clear the user from Zustand store
                // Optionally redirect to login page
                window.location.href = '/'; // Redirect to login or show a login modal
            }
        } else if (error.request) {
            // If no response was received from the server
            console.error('No Response from Server:', error.request);
        } else {
            // If there was an error setting up the request
            console.error('Error in Request Setup:', error.message);
        }
        return Promise.reject(error);  // Reject the promise to propagate the error
    }
);

export default api;
