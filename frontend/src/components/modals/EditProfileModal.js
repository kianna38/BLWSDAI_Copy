'use client';

import { useState, useEffect } from 'react';
import { useUpdateUser } from '@/hooks/useUser';
import ToastModal from './ToastModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function EditProfileModal({ user, onClose }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        passwordHash: '', // empty by default
        role: user?.role || '',
        isHidden: user?.isHidden || false,
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });
    const [showPassword, setShowPassword] = useState(false); // Add state for password visibility

    const { updateUser } = useUpdateUser();

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name,
                email: user.email,
                passwordHash: '', // keep it empty unless user wants to update password
                role: user.role,
                isHidden: user.isHidden,
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
            setToastConfig({
                type: 'error',
                message: 'Please enter a valid email address.'
            });
            setIsToastOpen(true);
            setSaving(false);
            return;
        }

        try {
            await updateUser({ id: user.userId, userData: form });
            setToastConfig({
                type: 'success',
                message: 'Profile updated successfully!'
            });
            setIsToastOpen(true);
            onClose();
        } catch (err) {
            setToastConfig({
                type: 'error',
                message: err?.response?.data?.message || 'Something went wrong'
            });
            setIsToastOpen(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                <div className="m-4 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
                    <h2
                        className="text-3xl font-extrabold mb-8 text-center tracking-tight"
                        style={{ color: '#fb8500' }}
                    >
                        Edit Profile
                    </h2>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="peer w-full border-2 bg-white px-3 py-2 rounded-lg text-base focus:outline-none focus:border-[#fb8500] transition border-gray-300 text-gray-900"
                                required
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm transition-all peer-focus:text-xs peer-focus:text-[#219ebc] peer-valid:text-xs peer-valid:text-[#219ebc] text-[#219ebc]">
                                Name
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="peer w-full border-2 bg-white px-3 py-2 rounded-lg text-base focus:outline-none focus:border-[#fb8500] transition border-gray-300 text-gray-900"
                                required
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm transition-all peer-focus:text-xs peer-focus:text-[#219ebc] peer-valid:text-xs peer-valid:text-[#219ebc] text-[#219ebc]">
                                Email
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                name="passwordHash"
                                type={showPassword ? "text" : "password"}
                                value={form.passwordHash}
                                onChange={handleChange}
                                className="peer w-full border-2 bg-white px-3 py-2 rounded-lg text-base focus:outline-none focus:border-[#fb8500] transition border-gray-300 text-gray-900 pr-10"
                                placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm transition-all peer-focus:text-xs peer-focus:text-[#219ebc] peer-valid:text-xs peer-valid:text-[#219ebc] text-[#219ebc]">
                                New Password (optional)
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <FaEye className="w-5 h-5 text-[#023047]" />
                                )}
                            </button>
                        </div>

                        <div className="relative">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="peer w-full border-2 bg-white px-3 py-2 rounded-lg text-base focus:outline-none focus:border-[#fb8500] transition border-gray-300 text-gray-900 appearance-none"
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm transition-all peer-focus:text-xs peer-focus:text-[#219ebc] peer-valid:text-xs peer-valid:text-[#219ebc] text-[#219ebc]">
                                Role
                            </label>
                        </div>

                        <div className="col-span-2 flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ backgroundColor: '#023047' }}
                                className="px-4 py-2 text-white rounded-lg hover:brightness-90 transition font-medium disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
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
