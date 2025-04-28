import React, { useState } from 'react';
import { useCreateUser } from '@/hooks/useUser'; // Import the hook for creating a user

const AddUserModal = ({ isOpen, onClose }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        passwordHash: '',
        role: 'Admin', // Default value
    });

    const { createUserMutation } = useCreateUser();

    const handleSubmit = () => {
        createUserMutation.mutate(userData);
        onClose();
    };

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className={`fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Add User</h2>
                <label className="block text-sm font-medium mb-2">Name:</label>
                <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Password:</label>
                <input
                    type="password"
                    name="passwordHash"
                    value={userData.passwordHash}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Role:</label>
                <select
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                </select>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add User
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
