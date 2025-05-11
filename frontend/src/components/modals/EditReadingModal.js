'use client';

import { useUpdateReading } from '@/hooks/useReading';
import ToastModal from './ToastModal';
import { useState } from 'react';

export default function EditReadingModal({ isOpen, setIsOpen, editingReadingId, editingPresentReading, setEditingPresentReading }) {
    const { updateReadingMutation } = useUpdateReading();
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!editingReadingId || !editingPresentReading) {
            setToastConfig({
                type: 'error',
                message: 'Please fill all fields.'
            });
            setIsToastOpen(true);
            return;
        }

        updateReadingMutation.mutate({
            readingId: editingReadingId,
            updatedReadingData: { presentReading: parseFloat(editingPresentReading) },
        }, {
            onSuccess: () => {
                setToastConfig({
                    type: 'success',
                    message: 'Reading updated successfully!'
                });
                setIsToastOpen(true);
                setIsOpen(false);
            },
            onError: () => {
                setToastConfig({
                    type: 'error',
                    message: 'Error updating reading.'
                });
                setIsToastOpen(true);
            }
        });
    };

    return (
        <>
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-center">Edit Present Reading</h2>

                    <input
                        type="number"
                        value={editingPresentReading}
                        onChange={(e) => setEditingPresentReading(e.target.value)}
                        placeholder="New Present Reading (m³)"
                        className="w-full mb-4 border rounded px-3 py-2"
                    />

                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setIsOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                            Update
                        </button>
                    </div>
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
