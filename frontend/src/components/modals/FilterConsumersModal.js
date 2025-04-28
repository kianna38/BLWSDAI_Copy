'use client'
import { useState, useEffect } from 'react';

export default function FilterConsumersModal({ isOpen, onClose, onApply, filter }) {
    const [formData, setFormData] = useState({ ...filter });

    useEffect(() => {
        setFormData(filter); // Update modal state when filter prop changes
    }, [filter]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e, type) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const updatedArray = checked
                ? [...prev[type], value]
                : prev[type].filter(val => val !== value);
            return { ...prev, [type]: updatedArray };
        });
    };

    const handleSubmit = () => {
        onApply(formData);
        onClose();
    };

    const handleClearFilters = () => {
        // Reset formData to initial filter state (clear all selected filters)
        setFormData({
            Puroks: [],
            Statuses: [],
            NotifPreferences: [],
            SortBy: 'createdAt',
            SortDir: 'asc',
            Page: 1,
            PageSize: 10,
        });
    };

    return (
        isOpen ? (
            <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                <div className="m-5 bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">Filter Consumers</h3>

                    <form onSubmit={e => e.preventDefault()}>
                        {/* Purok Filter (Checkboxes) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Purok</label>
                            <div className=" flex space-x-3 justify-between mx-3">
                                {["_1", "_2", "_3", "_4", "_5"].map((purok) => (
                                    <div key={purok}>
                                        <input
                                            type="checkbox"
                                            value={purok}
                                            checked={formData.Puroks.includes(purok)}
                                            onChange={(e) => handleCheckboxChange(e, 'Puroks')}
                                            className="mr-2"
                                        />
                                        <span>{purok.replace('_', '')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter (Checkboxes) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <div className="space-y-2 flex justify-between mx-3">
                                {["Active", "Disconnected", "Cut"].map((status) => (
                                    <div key={status}>
                                        <input
                                            type="checkbox"
                                            value={status}
                                            checked={formData.Statuses.includes(status)}
                                            onChange={(e) => handleCheckboxChange(e, 'Statuses')}
                                            className="mr-2"
                                        />
                                        <span>{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Preference Filter (Checkboxes) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Notification Preference</label>
                            <div className="space-y-2">
                                {["SMS", "Email", "SMS_and_Email", "None"].map((notifPref) => (
                                    <div key={notifPref}>
                                        <input
                                            type="checkbox"
                                            value={notifPref}
                                            checked={formData.NotifPreferences.includes(notifPref)}
                                            onChange={(e) => handleCheckboxChange(e, 'NotifPreferences')}
                                            className="mr-2"
                                        />
                                        <span>{notifPref.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sort By Filter (Dropdown) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                name="SortBy"
                                value={formData.SortBy}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="lastName">Last Name</option>
                                <option value="purok">Purok</option>
                            </select>
                        </div>

                        {/* Sort Direction Filter (Dropdown) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Sort Direction</label>
                            <select
                                name="SortDir"
                                value={formData.SortDir}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-between gap-2">
                            {/* Clear Filters Button */}
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-4 py-2 shadow rounded bg-red-300 hover:bg-red-400 "
                            >
                                Clear Filters
                            </button>
                            <div className="space-x-2">

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 shadow rounded bg-slate-200 hover:bg-slate-400"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        ) : null
    );
}
