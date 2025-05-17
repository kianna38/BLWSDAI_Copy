'use client';

import { useState } from 'react';
import { useCreateUser } from '@/hooks/useUser';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ToastModal from './ToastModal';

export default function AddUserModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        passwordHash: '',
        role: 'Admin',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    const { createUserMutation } = useCreateUser();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);

        if (!form.name || !form.email || !form.passwordHash) {
            toast.error("All fields are required.");
            setSaving(false);
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(form.email)) {
            toast.error('Please enter a valid email address.');
            setSaving(false);
            return;
        }



        try {
            await createUserMutation.mutateAsync(form);
            setToastConfig({
                type: 'success',
                message: 'User added successfully!',
            });
            setIsToastOpen(true);
            onClose();
        } catch (err) {
            setToastConfig({
                type: 'error',
                message: err?.response?.data?.message || 'Something went wrong.',
            });
            setIsToastOpen(true);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                <div className="m-4 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
                    <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-[#fb8500]">
                        Add User
                    </h2>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="relative">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="peer w-full border-2 px-3 py-2 rounded-lg text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-[#fb8500]"
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-[#219ebc] peer-focus:text-xs peer-valid:text-xs">
                                Name
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="peer w-full border-2 px-3 py-2 rounded-lg text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-[#fb8500]"
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-[#219ebc] peer-focus:text-xs peer-valid:text-xs">
                                Email
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                name="passwordHash"
                                type={showPassword ? 'text' : 'password'}
                                value={form.passwordHash}
                                onChange={handleChange}
                                required
                                className="peer w-full border-2 px-3 py-2 pr-10 rounded-lg text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-[#fb8500]"
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-[#219ebc] peer-focus:text-xs peer-valid:text-xs">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                            >
                                {showPassword ? <FaEyeSlash className="w-5 h-5 text-gray-500" /> : <FaEye className="w-5 h-5 text-[#023047]" />}
                            </button>
                        </div>

                        <div className="relative">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                required
                                className="peer w-full border-2 px-3 py-2 rounded-lg text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-[#fb8500]"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-[#219ebc] peer-focus:text-xs peer-valid:text-xs">
                                Role
                            </label>
                        </div>

                        <div className="col-span-2 flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 text-white rounded-lg font-medium transition disabled:opacity-50"
                                style={{ backgroundColor: '#023047' }}
                            >
                                {saving ? 'Saving...' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ToastModal
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                type={toastConfig.type}
                message={toastConfig.message}
            />
        </>
    );
}
