import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function ToastModal({ isOpen, onClose, type, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-[#fb8500]';
    const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;

    return (
        <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-6 h-6 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-[#fb8500]'}`} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Confirm'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={() => {
                                    onCancel?.();
                                    onClose();
                                }}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm?.();
                                    onClose();
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Yes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#023047] text-white rounded-lg hover:brightness-90 transition font-medium"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 