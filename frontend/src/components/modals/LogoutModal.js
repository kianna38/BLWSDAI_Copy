'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';

export default function LogoutModal({ isOpen, setIsOpen, onLogout }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Logout</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                    Are you sure you want to log out?
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
} 