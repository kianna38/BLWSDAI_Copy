import React, { useState } from 'react';
import { useUpdateRatesInfo } from '@/hooks/useRatesInfo'; // Import the hook for updating rates

const EditRatesModal = ({ isOpen, onClose, currentRates }) => {
    const [ratesData, setRatesData] = useState({
        consumerCubicMeterRate: currentRates.consumerCubicMeterRate,
        motherMeterCubicMeterRate: currentRates.motherMeterCubicMeterRate,
        penaltyRate: currentRates.penaltyRate,
        subsidyRate: currentRates.subsidyRate,
    });

    const { updateRatesInfo } = useUpdateRatesInfo();

    const handleSubmit = (e) => {
        e.preventDefault();
        updateRatesInfo.mutate(ratesData);
        onClose();
    };

    const handleChange = (e) => {
        setRatesData({
            ...ratesData,
            [e.target.name]: e.target.value,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="m-4 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
                <h2
                    className="text-3xl font-extrabold mb-8 text-center tracking-tight"
                    style={{ color: '#fb8500' }}
                >
                    Edit Rates
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: 'Consumer Rate', name: 'consumerCubicMeterRate' },
                        { label: 'Mother Meter Rate', name: 'motherMeterCubicMeterRate' },
                        { label: 'Penalty Rate', name: 'penaltyRate' },
                        { label: 'Subsidy Rate', name: 'subsidyRate' },
                    ].map(({ label, name }) => (
                        <div key={name} className="relative">
                            <input
                                type="number"
                                name={name}
                                value={ratesData[name] || ''}
                                onChange={handleChange}
                                className="peer w-full border-2 bg-white px-3 py-2 rounded-lg text-base focus:outline-none focus:border-[#fb8500] transition border-gray-300 text-gray-900"
                                required
                            />
                            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm transition-all peer-focus:text-xs peer-focus:text-[#219ebc] peer-valid:text-xs peer-valid:text-[#219ebc] text-[#219ebc]">
                                {label}
                            </label>
                        </div>
                    ))}

                    <div className="col-span-2 flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700 font-medium"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            style={{ backgroundColor: '#023047' }}
                            className="px-4 py-2 text-white rounded-lg hover:brightness-90 transition font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRatesModal;
