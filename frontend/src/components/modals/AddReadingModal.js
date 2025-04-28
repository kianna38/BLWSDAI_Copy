'use client';

import { Combobox } from '@headlessui/react';
import { useState } from 'react';
import { useCreateReading } from '@/hooks/useReading';
import { useFilterConsumers } from '@/hooks/useConsumer';

export default function AddReadingModal({ isOpen, setIsOpen }) {
    const { createReadingMutation } = useCreateReading();
    const { data: consumerData } = useFilterConsumers({ statuses: ['Active'], pageSize: 500 });
    const [consumerSearch, setConsumerSearch] = useState('');
    const [selectedConsumerId, setSelectedConsumerId] = useState('');
    const [inputPresentReading, setInputPresentReading] = useState('');

    if (!isOpen) return null;

    const filteredConsumers = consumerData?.data?.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return fullName.includes(consumerSearch.toLowerCase());
    }) || [];

    const handleSubmit = () => {
        if (!selectedConsumerId || !inputPresentReading) {
            alert('Fill all fields.');
            return;
        }

        const today = new Date();
        const monthYearDate = new Date(today.getFullYear(), today.getMonth(), 1);

        createReadingMutation.mutate({
            consumerId: parseInt(selectedConsumerId),
            presentReading: parseFloat(inputPresentReading),
            monthYear: monthYearDate.toISOString(),
        }, {
            onSuccess: () => {
                alert('Reading added!');
                setIsOpen(false);
                setSelectedConsumerId('');
                setInputPresentReading('');
            },
            onError: () => alert('Error adding reading.')
        });
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">Add New Reading</h2>

                <Combobox value={selectedConsumerId} onChange={setSelectedConsumerId}>
                    <div className="relative">
                        <Combobox.Input
                            className="w-full border rounded px-3 py-2 mb-2"
                            placeholder="Search consumer..."
                            onChange={(e) => setConsumerSearch(e.target.value)}
                        />
                        <Combobox.Options className="absolute mt-1 w-full bg-white shadow max-h-60 overflow-y-auto">
                            {filteredConsumers.map(c => (
                                <Combobox.Option key={c.consumerId} value={c.consumerId} className="px-4 py-2 hover:bg-cyan-100 cursor-pointer">
                                    {c.lastName}, {c.firstName}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </div>
                </Combobox>

                <input
                    type="number"
                    value={inputPresentReading}
                    onChange={(e) => setInputPresentReading(e.target.value)}
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
