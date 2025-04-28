'use client';

import { useState, useEffect } from 'react';
import { useUpdateUser } from '@/hooks/useUser'; // Import the useUpdateUser hook

export default function EditProfileModal({ user, onClose }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        passwordHash: '', // empty by default
        role: user?.role || '',
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const { updateUser } = useUpdateUser(); // Use the updateUser function from the hook

    // Ensure form is updated when user prop changes
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name,
                email: user.email,
                passwordHash: '', // keep it empty unless user wants to update password
                role: user.role,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);

        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(form.email)) {
            setError('Please enter a valid email address.');
            setSaving(false);
            return;
        }

        try {
            // Trigger the update user mutation with userId and form data
            console.log(`userID on modal: ${user.userId}`);
            await updateUser({ id: user.userId, userData: form }); // Call mutate directly from hook
            alert('Profile updated successfully');
            onClose(); // Close the modal after successful update
        } catch (err) {
            // Catch errors from the mutation
            setError(err?.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false); // Ensure saving state is reset
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

                <div className="space-y-3">
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="passwordHash"
                        type="password"
                        value={form.passwordHash}
                        onChange={handleChange}
                        placeholder="New Password"
                        className="w-full border p-2 rounded"
                    />
                </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
