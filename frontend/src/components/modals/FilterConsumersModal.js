'use client'
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Filter Consumers</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={e => e.preventDefault()}>
                        {/* Purok Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Purok</label>
                            <div className="grid grid-cols-5 gap-2">
                                {["_1", "_2", "_3", "_4", "_5"].map((purok) => (
                                    <label key={purok} className="relative flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            value={purok}
                                            checked={formData.Puroks.includes(purok)}
                                            onChange={(e) => handleCheckboxChange(e, 'Puroks')}
                                            className="sr-only peer"
                                        />
                                        <span className={`text-sm font-medium ${formData.Puroks.includes(purok) ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {purok.replace('_', '')}
                                        </span>
                                        {formData.Puroks.includes(purok) && (
                                            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Active", "Disconnected", "Cut"].map((status) => (
                                    <label key={status} className="relative flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            value={status}
                                            checked={formData.Statuses.includes(status)}
                                            onChange={(e) => handleCheckboxChange(e, 'Statuses')}
                                            className="sr-only peer"
                                        />
                                        <span className={`text-sm font-medium ${
                                            formData.Statuses.includes(status) 
                                                ? status === 'Active' 
                                                    ? 'text-green-600' 
                                                    : status === 'Disconnected'
                                                        ? 'text-orange-600'
                                                        : 'text-red-600'
                                                : 'text-gray-600'
                                        }`}>
                                            {status}
                                        </span>
                                        {formData.Statuses.includes(status) && (
                                            <div className={`absolute inset-0 border-2 rounded-lg pointer-events-none ${
                                                status === 'Active' 
                                                    ? 'border-green-500' 
                                                    : status === 'Disconnected'
                                                        ? 'border-orange-500'
                                                        : 'border-red-500'
                                            }`}></div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Notification Preference Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Notification Preference</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["SMS", "Email", "SMS_and_Email", "None"].map((notifPref) => (
                                    <label key={notifPref} className="relative flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            value={notifPref}
                                            checked={formData.NotifPreferences.includes(notifPref)}
                                            onChange={(e) => handleCheckboxChange(e, 'NotifPreferences')}
                                            className="sr-only peer"
                                        />
                                        <span className={`text-sm font-medium ${formData.NotifPreferences.includes(notifPref) ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {notifPref.replace('_', ' ')}
                                        </span>
                                        {formData.NotifPreferences.includes(notifPref) && (
                                            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    name="SortBy"
                                    value={formData.SortBy}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="lastName">Last Name</option>
                                    <option value="createdAt">Date Created</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Direction</label>
                                <select
                                    name="SortDir"
                                    value={formData.SortDir}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Clear Filters
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
