'use client';

import { useUpdateReading } from '@/hooks/useReading';

export default function EditReadingModal({ isOpen, setIsOpen, editingReadingId, editingPresentReading, setEditingPresentReading }) {
    const { updateReadingMutation } = useUpdateReading();

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!editingReadingId || !editingPresentReading) {
            alert('Fill all fields.');
            return;
        }

        updateReadingMutation.mutate({
            readingId: editingReadingId,
            updatedReadingData: { presentReading: parseFloat(editingPresentReading) },
        }, {
            onSuccess: () => {
                alert('Reading updated!');
                setIsOpen(false);
            },
            onError: () => alert('Error updating reading.')
        });
    };

    return (
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
    );
}
