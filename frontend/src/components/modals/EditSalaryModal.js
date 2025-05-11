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
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="m-4 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
                <h2
                    className="text-3xl font-extrabold mb-8 text-center tracking-tight"
                    style={{ color: '#fb8500' }}
                >
                    Edit Staff Salary
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: 'President Salary', name: 'presidentSalary' },
                        { label: 'Vice President Salary', name: 'vicePresidentSalary' },
                        { label: 'Secretary Salary', name: 'secretarySalary' },
                        { label: 'Treasurer Salary', name: 'treasurerSalary' },
                        { label: 'Auditor Salary', name: 'auditorSalary' },
                        { label: 'Maintenance 1 Salary', name: 'maintenanceOneSalary' },
                        { label: 'Maintenance 2 Salary', name: 'maintenanceTwoSalary' },
                    ].map(({ label, name }) => (
                        <div key={name} className="relative">
                            <input
                                type="number"
                                name={name}
                                value={salaryData[name] || ''}
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

export default EditSalaryModal;
