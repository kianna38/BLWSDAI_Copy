import { useState, useEffect } from 'react';
import { useUpdateConsumer } from '@/hooks/useConsumer'; // Assuming you have the update consumer hook

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EditConsumerModal({ isOpen, onClose, consumer }) {
    // Initialize form data with the existing consumer values
    const [formData, setFormData] = useState({
        firstName: consumer?.firstName || '',
        lastName: consumer?.lastName || '',
        middleInitial: consumer?.middleInitial || '',
        meterNumber: consumer?.meterNumber || '',
        phoneNumber: consumer?.phoneNumber || '',
        email: consumer?.email || '',
        purok: consumer?.purok || '_1',
        status: consumer?.status || 'Active',  // Default to Active if no value
        notifPreference: consumer?.notifPreference || 'SMS',  // Default to SMS if no value
    });
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const { updateConsumerMutation } = useUpdateConsumer();

    useEffect(() => {
        // Reset form data if the consumer prop changes (e.g., when opening the modal with new consumer data)
        setFormData({
            firstName: consumer?.firstName || '',
            lastName: consumer?.lastName || '',
            middleInitial: consumer?.middleInitial || '',
            meterNumber: consumer?.meterNumber || '',
            phoneNumber: consumer?.phoneNumber || '',
            email: consumer?.email || '',
            purok: consumer?.purok || '_1',
            status: consumer?.status || 'Active',
            notifPreference: consumer?.notifPreference || 'SMS',
        });
        setTouched({});
        setSubmitAttempted(false);
    }, [consumer]);

    // Validation logic
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    else if (/\d/.test(formData.firstName)) errors.firstName = "First name must not contain numbers";
    if (!formData.lastName) errors.lastName = "Last name is required";
    else if (/\d/.test(formData.lastName)) errors.lastName = "Last name must not contain numbers";
    if (formData.middleInitial && formData.middleInitial.length > 1) errors.middleInitial = "Only 1 character";
    if (!formData.meterNumber) errors.meterNumber = "Meter number is required";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^[0-9]{11}$/.test(formData.phoneNumber)) errors.phoneNumber = "Phone number must be 11 digits";
    if (!formData.email) errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email address";

    const isValid = Object.keys(errors).length === 0;

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitAttempted(true);
        if (!isValid) return;
        updateConsumerMutation.mutate({ id: consumer.consumerId, consumerData: formData });
        onClose();
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber' && !/^[0-9]*$/.test(value)) return;
        if (name === 'meterNumber' && !/^[0-9]*$/.test(value)) return;
        if ((name === 'firstName' || name === 'lastName') && /\d/.test(value)) return;
        if (name === 'middleInitial' && value.length > 1) return;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    return (
        isOpen ? (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                <div className="m-4 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
                    <h2
                        className="text-3xl font-extrabold mb-8 text-center tracking-tight"
                        style={{ color: '#fb8500' }}
                    >
                        Edit Consumer
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="relative">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.firstName && (touched.firstName || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                required
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.firstName && 'top-0 text-xs text-[#fb8500]'}`}>First Name</label>
                            {errors.firstName && (touched.firstName || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                            )}
                        </div>
                        {/* Last Name */}
                        <div className="relative">
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.lastName && (touched.lastName || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                required
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.lastName && 'top-0 text-xs text-[#fb8500]'}`}>Last Name</label>
                            {errors.lastName && (touched.lastName || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                            )}
                        </div>
                        {/* Middle Initial */}
                        <div className="relative">
                            <input
                                type="text"
                                name="middleInitial"
                                value={formData.middleInitial}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={1}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.middleInitial && (touched.middleInitial || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.middleInitial && 'top-0 text-xs text-[#fb8500]'}`}>Middle Initial (optional)</label>
                            {errors.middleInitial && (touched.middleInitial || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.middleInitial}</p>
                            )}
                        </div>
                        {/* Meter Number */}
                        <div className="relative">
                            <input
                                type="text"
                                name="meterNumber"
                                value={formData.meterNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.meterNumber && (touched.meterNumber || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                required
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.meterNumber && 'top-0 text-xs text-[#fb8500]'}`}>Meter Number</label>
                            {errors.meterNumber && (touched.meterNumber || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.meterNumber}</p>
                            )}
                        </div>
                        {/* Phone Number */}
                        <div className="relative">
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.phoneNumber && (touched.phoneNumber || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                required
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.phoneNumber && 'top-0 text-xs text-[#fb8500]'}`}>Phone Number</label>
                            {errors.phoneNumber && (touched.phoneNumber || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>
                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`peer w-full border-b-2 bg-transparent px-2 pt-4 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition ${errors.email && (touched.email || submitAttempted) ? 'border-red-500' : 'border-slate-300'}`}
                                required
                                autoComplete="off"
                            />
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.email && 'top-0 text-xs text-[#fb8500]'}`}>Email</label>
                            {errors.email && (touched.email || submitAttempted) && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                        {/* Purok */}
                        <div className="relative">
                            <select
                                name="purok"
                                value={formData.purok}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="peer w-full border-b-2 bg-transparent px-2 pt-6 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition border-slate-300 appearance-none"
                            >
                                <option value="_1">1</option>
                                <option value="_2">2</option>
                                <option value="_3">3</option>
                                <option value="_4">4</option>
                                <option value="_5">5</option>
                            </select>
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.purok && 'top-0 text-xs text-[#fb8500]'}`}>Purok</label>
                        </div>
                        {/* Status */}
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="peer w-full border-b-2 bg-transparent px-2 pt-6 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition border-slate-300 appearance-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Disconnected">Disconnected</option>
                                <option value="Cut">Cut</option>
                            </select>
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.status && 'top-0 text-xs text-[#fb8500]'}`}>Status</label>
                        </div>
                        {/* Notification Preference */}
                        <div className="relative md:col-span-2">
                            <select
                                name="notifPreference"
                                value={formData.notifPreference}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="peer w-full border-b-2 bg-transparent px-2 pt-6 pb-1 text-base focus:outline-none focus:border-[#fb8500] transition border-slate-300 appearance-none"
                            >
                                <option value="SMS">SMS</option>
                                <option value="Email">Email</option>
                                <option value="SMS_and_Email">SMS and Email</option>
                            </select>
                            <label className={`absolute left-2 top-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#fb8500] ${formData.notifPreference && 'top-0 text-xs text-[#fb8500]'}`}>Notification Preference</label>
                        </div>
                        {/* Action Buttons */}
                        <div className="md:col-span-2 flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                style={{ backgroundColor: '#023047' }}
                                className={`px-4 py-2 text-white rounded hover:brightness-90 transition ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isValid}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : null
    );
}
