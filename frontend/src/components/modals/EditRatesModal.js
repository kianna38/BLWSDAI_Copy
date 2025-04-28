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

    const handleSubmit = () => {
        updateRatesInfo.mutate(ratesData);
        onClose();
    };

    const handleChange = (e) => {
        setRatesData({
            ...ratesData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-xl font-semibold mb-4 justify-center flex">Edit Rates</h2>
                <label className="block text-sm font-medium mb-2">Consumer Rate:</label>
                <input
                    type="number"
                    name="consumerCubicMeterRate"
                    value={ratesData.consumerCubicMeterRate}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Mother Meter Rate:</label>
                <input
                    type="number"
                    name="motherMeterCubicMeterRate"
                    value={ratesData.motherMeterCubicMeterRate}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Penalty Rate:</label>
                <input
                    type="number"
                    name="penaltyRate"
                    value={ratesData.penaltyRate}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-2">Subsidy Rate:</label>
                <input
                    type="number"
                    name="subsidyRate"
                    value={ratesData.subsidyRate}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRatesModal;
