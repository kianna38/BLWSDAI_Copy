'use client';

import { Combobox } from '@headlessui/react';
import { useState } from 'react';
import { useCreateReading } from '@/hooks/useReading';
import { useFilterConsumers } from '@/hooks/useConsumer';
import ToastModal from './ToastModal';

export default function AddReadingModal({ isOpen, setIsOpen }) {
    const { createReadingMutation } = useCreateReading();
    const { data: consumerData } = useFilterConsumers({ statuses: ['Active'], pageSize: 500 });
    const [consumerSearch, setConsumerSearch] = useState('');
    const [selectedConsumerId, setSelectedConsumerId] = useState('');
    const [inputPresentReading, setInputPresentReading] = useState('');
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    if (!isOpen) return null;

    const filteredConsumers = consumerData?.data?.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return fullName.includes(consumerSearch.toLowerCase());
    }) || [];

    // Validation
    const errors = {};
    if (!selectedConsumerId) errors.selectedConsumerId = "Consumer is required";
    if (!inputPresentReading) errors.inputPresentReading = "Present reading is required";
    else if (isNaN(inputPresentReading) || Number(inputPresentReading) < 0) errors.inputPresentReading = "Must be a positive number";

    const isValid = Object.keys(errors).length === 0;

    const handleSubmit = () => {
        setSubmitAttempted(true);
        if (!isValid) return;
        const today = new Date();
        const monthYearDate = new Date(today.getFullYear(), today.getMonth(), 1);

        createReadingMutation.mutate({
            consumerId: parseInt(selectedConsumerId),
            presentReading: parseFloat(inputPresentReading),
            monthYear: monthYearDate.toISOString(),
        }, {
            onSuccess: () => {
                setToastConfig({
                    type: 'success',
                    message: 'Reading created successfully!'
                });
                setIsToastOpen(true);
                setIsOpen(false);
                setSelectedConsumerId('');
                setInputPresentReading('');
                setTouched({});
                setSubmitAttempted(false);
            },
            onError: () => {
                setToastConfig({
                    type: 'error',
                    message: 'Error creating reading.'
                });
                setIsToastOpen(true);
            }
        });
    };

    return (
        <>
            <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
                    <h2
                        className="text-2xl font-extrabold mb-8 text-center tracking-tight"
                        style={{ color: '#fb8500' }}
                    >
                        Add New Reading
                    </h2>

                    {/* Consumer Combobox */}
                    <div className="relative mb-6">
                        <Combobox value={selectedConsumerId} onChange={setSelectedConsumerId}>
                            <div className="relative">
                                <Combobox.Input
                                    className={`peer w-full border-b-2 bg-transparent px-2 pt-6 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.selectedConsumerId && (touched.selectedConsumerId || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                    placeholder=" "
                                    onChange={(e) => setConsumerSearch(e.target.value)}
                                    onBlur={() => setTouched(t => ({ ...t, selectedConsumerId: true }))}
                                />
                                <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${selectedConsumerId && 'top-0 text-xs text-[#fb8500]'}`}>Select Consumer</label>
                                <Combobox.Options className="absolute mt-1 w-full bg-white shadow max-h-60 overflow-y-auto z-10">
                                    {filteredConsumers.map(c => (
                                        <Combobox.Option key={c.consumerId} value={c.consumerId} className="px-4 py-2 hover:bg-cyan-100 cursor-pointer">
                                            {c.lastName}, {c.firstName}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            </div>
                        </Combobox>
                        {errors.selectedConsumerId && (touched.selectedConsumerId || submitAttempted) && (
                            <p className="text-red-500 text-xs mt-1">{errors.selectedConsumerId}</p>
                        )}
                    </div>

                    {/* Present Reading Input */}
                    <div className="relative mb-6">
                        <input
                            type="number"
                            value={inputPresentReading}
                            onChange={(e) => setInputPresentReading(e.target.value)}
                            onBlur={() => setTouched(t => ({ ...t, inputPresentReading: true }))}
                            className={`peer w-full border-b-2 bg-transparent px-2 pt-6 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.inputPresentReading && (touched.inputPresentReading || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                            placeholder=" "
                            min={0}
                        />
                        <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${inputPresentReading && 'top-0 text-xs text-[#fb8500]'}`}>Present Reading (m³)</label>
                        {errors.inputPresentReading && (touched.inputPresentReading || submitAttempted) && (
                            <p className="text-red-500 text-xs mt-1">{errors.inputPresentReading}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            style={{ backgroundColor: '#023047' }}
                            className={`px-4 py-2 text-white rounded hover:brightness-90 transition ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!isValid}
                            onClick={handleSubmit}
                        >
                            Add Reading
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
