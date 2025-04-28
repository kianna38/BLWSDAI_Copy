import React, { useState, useEffect } from 'react';
import { useCreateOrUpdateSalary } from '@/hooks/useSalaryInfo'; // Import the hook to update salary info

const EditSalaryModal = ({ isOpen, onClose, currentSalary }) => {
    // Initialize state with current salary or default values (e.g., 0)
    const [salaryData, setSalaryData] = useState({
        presidentSalary: currentSalary?.presidentSalary || 0,
        vicePresidentSalary: currentSalary?.vicePresidentSalary || 0,
        secretarySalary: currentSalary?.secretarySalary || 0,
        treasurerSalary: currentSalary?.treasurerSalary || 0,
        auditorSalary: currentSalary?.auditorSalary || 0,
        maintenanceOneSalary: currentSalary?.maintenanceOneSalary || 0,
        maintenanceTwoSalary: currentSalary?.maintenanceTwoSalary || 0,
    });

    const { createOrUpdateSalaryMutation } = useCreateOrUpdateSalary();

    // Effect to update state if currentSalary changes (e.g., after a successful mutation)
    useEffect(() => {
        if (currentSalary) {
            setSalaryData({
                presidentSalary: currentSalary.presidentSalary || 0,
                vicePresidentSalary: currentSalary.vicePresidentSalary || 0,
                secretarySalary: currentSalary.secretarySalary || 0,
                treasurerSalary: currentSalary.treasurerSalary || 0,
                auditorSalary: currentSalary.auditorSalary || 0,
                maintenanceOneSalary: currentSalary.maintenanceOneSalary || 0,
                maintenanceTwoSalary: currentSalary.maintenanceTwoSalary || 0,
            });
        }
    }, [currentSalary]);

    const handleSubmit = () => {
        // Ensure we send all valid numbers to the mutation
        const dataToSubmit = {
            presidentSalary: parseFloat(salaryData.presidentSalary) || 0,
            vicePresidentSalary: parseFloat(salaryData.vicePresidentSalary) || 0,
            secretarySalary: parseFloat(salaryData.secretarySalary) || 0,
            treasurerSalary: parseFloat(salaryData.treasurerSalary) || 0,
            auditorSalary: parseFloat(salaryData.auditorSalary) || 0,
            maintenanceOneSalary: parseFloat(salaryData.maintenanceOneSalary) || 0,
            maintenanceTwoSalary: parseFloat(salaryData.maintenanceTwoSalary) || 0,
        };

        createOrUpdateSalaryMutation.mutate(dataToSubmit);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Ensure numeric input is correctly parsed
        setSalaryData({
            ...salaryData,
            [name]: value === '' ? '' : parseFloat(value), // Prevent NaN issues
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-xl font-semibold mb-4 justify-center flex">Edit Salary</h2>

                <div className="">
                    {[
                        { label: 'President Salary', name: 'presidentSalary' },
                        { label: 'Vice President Salary', name: 'vicePresidentSalary' },
                        { label: 'Secretary Salary', name: 'secretarySalary' },
                        { label: 'Treasurer Salary', name: 'treasurerSalary' },
                        { label: 'Auditor Salary', name: 'auditorSalary' },
                        { label: 'Maintenance 1 Salary', name: 'maintenanceOneSalary' },
                        { label: 'Maintenance 2 Salary', name: 'maintenanceTwoSalary' },
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium mb-1">{label}:</label>
                            <input
                                type="number"
                                name={name}
                                value={salaryData[name] || ''}
                                onChange={handleChange}
                                className="w-full p-2 mb-2 border border-gray-300 rounded"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 ">
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

export default EditSalaryModal;
