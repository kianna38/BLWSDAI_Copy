'use client';

import React from 'react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
                <h2 className="text-lg font-bold mb-2 text-[#fb8500]">Forgot Password</h2>
                <p className="mb-4 text-gray-700">
                    Please contact your admin or email at <span className="font-semibold">blwsdai@gmail.com</span>
                </p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#023047] text-white rounded hover:bg-[#fb8500] transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
}