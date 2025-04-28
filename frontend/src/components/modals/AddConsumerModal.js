import { useState } from 'react';
import { useCreateConsumer } from '@/hooks/useConsumer';

export default function AddConsumerModal({ isOpen, onClose }) {
    // Local state for the form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleInitial: '',
        meterNumber: '',
        phoneNumber: '',
        email: '',
        purok: '_1',
        status: 'Active',  // Default value
        notifPreference: 'SMS',  // Default value
    }); 

    const { createConsumerMutation } = useCreateConsumer();

    // Validate phone number (e.g., allow only digits and 10 characters length)
    const validatePhoneNumber = (phoneNumber) => {
        const regex = /^[0-9]{11}$/; // Example: 10-digit phone number
        return regex.test(phoneNumber);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate phone number before submission
        if (!validatePhoneNumber(formData.phoneNumber)) {
            alert('Please enter a valid 11-digit phone number');
            return;
        }
        createConsumerMutation.mutate(formData);
        onClose();
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Allow only numbers for phone number
        if (name === 'phoneNumber' && !/^[0-9]*$/.test(value)) return;  // Ignore non-numeric input
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        isOpen ? (
            <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                <div className="m-4 bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Add Consumer</h3>
                    <form onSubmit={handleSubmit}>

                        <div className="flex space-x-2 mb-4">
                            {/* First Name */}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Last Name */}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex space-x-5 mb-4">
                            {/* Meter Number */}
                            <div className="w-3/5">
                                <label className="block text-sm font-medium">Meter Number</label>
                                <input
                                    type="number"
                                    name="meterNumber"
                                    value={formData.meterNumber}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Purok */}
                            <div className="w-1/5">
                                <label className="block text-sm font-medium">Purok</label>
                                <select
                                    name="purok"
                                    value={formData.purok}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="_1">1</option>
                                    <option value="_2">2</option>
                                    <option value="_3">3</option>
                                    <option value="_4">4</option>
                                    <option value="_5">5</option>
                                </select>
                            </div>

                            {/* Middle Initial */}
                            <div className="w-1/5">
                                <label className="block text-sm font-medium">M. I.</label>
                                <input
                                    type="text"
                                    name="middleInitial"
                                    value={formData.middleInitial}
                                    onChange={handleChange}
                                    maxLength={1}  // Limit to 1 character
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2 mb-4">
                            {/* Phone Number */}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                                {/* Phone number validation message */}
                                {formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber) && (
                                    <p className="text-red-500 text-sm mt-1">Phone number must be 11 digits.</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="Active">Active</option>
                                <option value="Disconnected">Disconnected</option>
                                <option value="Cut">Cut</option>
                            </select>
                        </div>

                        {/* Notification Preference */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Notification Preference</label>
                            <select
                                name="notifPreference"
                                value={formData.notifPreference}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="SMS">SMS</option>
                                <option value="Email">Email</option>
                                <option value="SMS_and_Email">SMS and Email</option>
                                <option value="None">None</option>
                            </select>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            >
                                Add Consumer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : null
    );
}
