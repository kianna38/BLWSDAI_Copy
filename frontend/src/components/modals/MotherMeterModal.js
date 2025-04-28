'use client';

import { useCreateUpdateMotherMeterReading } from '@/hooks/useMotherMeter';
import { useState } from 'react';

export default function MotherMeterModal({ isOpen, setIsOpen, selectedMonthYear }) {
    const { createUpdateReadingMutation } = useCreateUpdateMotherMeterReading();
    const [presentReading, setPresentReading] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!presentReading) {
            alert('Enter present reading.');
            return;
        }

        const [year, month] = selectedMonthYear.split(' ');
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        const monthYearDate = new Date(Date.UTC(parseInt(year), monthIndex, 1));

        createUpdateReadingMutation.mutate({
            presentReading: parseFloat(presentReading),
            monthYear: monthYearDate.toISOString(),
        }, {
            onSuccess: () => {
                alert('Mother meter reading updated!');
                setIsOpen(false);
            },
            onError: () => alert('Error updating mother meter reading.')
        });
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">Mother Meter Reading</h2>

                <input
                    type="number"
                    value={presentReading}
                    onChange={(e) => setPresentReading(e.target.value)}
                    placeholder="Present Reading (m³)"
                    className="w-full mb-4 border rounded px-3 py-2"
                />

                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
