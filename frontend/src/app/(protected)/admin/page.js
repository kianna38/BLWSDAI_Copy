'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFilterUsers } from '@/hooks/useUser';  // Assuming this hook is for filtered users
import { useDeleteBill } from '@/hooks/useBill';
import { useLatestSalary } from '@/hooks/useSalaryInfo';
import { useRatesInfo } from '@/hooks/useRatesInfo';
import EditSalaryModal from '@/components/modals/EditSalaryModal';
import EditRatesModal from '@/components/modals/EditRatesModal';
import AddUserModal from '@/components/modals/AddUserModal';
import FilterUsersModal from '@/components/modals/FilterUsersModal';  // Ensure this modal handles the filter functionality
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { formatDate } from '@/utils/formatDate';
import { useDeleteUser } from '@/hooks/useUser'; // Import the delete user hook
import EditProfileModal from '@/components/modals/EditProfileModal'; // Import the edit modal
import RevertBillsModal from '@/components/modals/RevertBillsModal';
import ToastModal from '@/components/modals/ToastModal';

export default function AdminPage() {
    const { deleteUserMutation } = useDeleteUser(); // Destructure delete mutation from hook
    const [editProfileOpen, setEditProfileOpen] = useState(false); // State to manage modal visibility
    const [selectedUser, setSelectedUser] = useState(null); // Store the user that is selected for editing


    const { latestSalaryQuery } = useLatestSalary();
    const { getRatesInfo } = useRatesInfo();
    const { deleteBillsMutation } = useDeleteBill();

    const [isEditSalaryOpen, setEditSalaryOpen] = useState(false);
    const [isEditRatesOpen, setEditRatesOpen] = useState(false);
    const [isAddUserOpen, setAddUserOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter state for users, roles, sorting, and pagination
    const [filter, setFilter] = useState({
        roles: [],      // Roles filter (Admin, Staff)
        page: 1,        // Current page
        pageSize: 10,    // Number of users per page
        sortBy: 'name', // Default sort by name
        sortDir: 'desc', // Default sorting direction
    });

    const [internalSortDir, setInternalSortDir] = useState(filter.sortDir);

    const { data: users, isLoading: usersLoading } = useFilterUsers(filter);

    const totalSalary =
        (latestSalaryQuery?.data?.presidentSalary || 0) +
        (latestSalaryQuery?.data?.vicePresidentSalary || 0) +
        (latestSalaryQuery?.data?.secretarySalary || 0) +
        (latestSalaryQuery?.data?.treasurerSalary || 0) +
        (latestSalaryQuery?.data?.auditorSalary || 0) +
        (latestSalaryQuery?.data?.maintenanceOneSalary || 0) +
        (latestSalaryQuery?.data?.maintenanceTwoSalary || 0);

    // Handle filter change
    useEffect(() => {
        setFilter(prev => ({ ...prev, sortDir: internalSortDir, page: 1 }));
    }, [internalSortDir]);

    const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleRevertBill = () => {
        // Logic to handle bill revert action
        deleteBillsMutation.mutate();
    };

    const handleSort = (field) => {
        setFilter(prev => ({
            ...prev,
            sortBy: field,
            sortDir: prev.sortBy === field && prev.sortDir === "asc" ? "desc" : "asc",
            page: 1,
        }));
    };


    // Filter users based on the search query
    const filteredUsers = useMemo(() => {
        if (!users?.data) return [];

        if (!searchQuery) return users.data;

        return users.data.filter(user => {
            const createdAtStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "";
            return (
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                createdAtStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [users?.data, searchQuery]);


    const total = users?.totalCount || 0;
    const start = (filter.page - 1) * filter.pageSize + 1;
    const end = start + filteredUsers.length - 1;
    const totalPages = users?.totalPages || 1;

    const handlePageChange = (newPage) => {
        const validPage = Math.min(Math.max(1, newPage), totalPages);
        if (validPage !== filter.page) {
            setFilter(prev => ({ ...prev, page: validPage }));
        }
    };

    const today = new Date();
    const monthYear = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString();

    const handleDeleteBills = () => {
        const today = new Date();
        const monthYear = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString();

        deleteBillsMutation.mutate(monthYear, {
            onSuccess: () => {
                setIsRevertModalOpen(false);
                setToastConfig({
                    type: 'success',
                    message: 'Bills deleted successfully!'
                });
                setIsToastOpen(true);
            },
            onError: (error) => {
                setIsRevertModalOpen(false);
                setToastConfig({
                    type: 'error',
                    message: error?.response?.status === 400 
                        ? 'There is no generated bill for this month'
                        : 'Error deleting bills.'
                });
                setIsToastOpen(true);
            }
        });
    };


    const handleDelete = (userId) => {
        setUserToDelete(userId);
        setToastConfig({
            type: 'confirm',
            message: 'Are you sure you want to delete this user?',
            onConfirm: () => {
                deleteUserMutation.mutate(userId, {
                    onSuccess: () => {
                        setToastConfig({
                            type: 'success',
                            message: 'User deleted successfully!'
                        });
                        setIsToastOpen(true);
                    },
                    onError: (error) => {
                        setToastConfig({
                            type: 'error',
                            message: error?.response?.data?.message || 'Error deleting user. Please try again.'
                        });
                        setIsToastOpen(true);
                    }
                });
            },
            onCancel: () => {
                setUserToDelete(null);
            }
        });
        setIsToastOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user); // Set the selected user for editing
        setEditProfileOpen(true); // Open the edit profile modal
    };

    if (usersLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fb8500]"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <button
                            onClick={() => setIsRevertModalOpen(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Revert This Month's Generated Bill
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6">
                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Staff Salary Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#fb8500]/10 p-1.5 rounded-full">
                                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#fb8500]' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2-2zm0 0V7m0 4v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4' /></svg>
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-[#023047]">Staff Salary</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Last updated: <span className="font-semibold text-gray-600">{formatDate(latestSalaryQuery?.data?.updatedAt)}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditSalaryOpen(true)}
                                className="bg-[#023047] text-white p-1.5 rounded-lg hover:bg-[#fb8500] transition-colors shadow"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 text-sm">
                            {[
                                { label: 'President', value: latestSalaryQuery?.data?.presidentSalary },
                                { label: 'Vice President', value: latestSalaryQuery?.data?.vicePresidentSalary },
                                { label: 'Secretary', value: latestSalaryQuery?.data?.secretarySalary },
                                { label: 'Treasurer', value: latestSalaryQuery?.data?.treasurerSalary },
                                { label: 'Maintenance 1', value: latestSalaryQuery?.data?.maintenanceOneSalary },
                                { label: 'Maintenance 2', value: latestSalaryQuery?.data?.maintenanceTwoSalary },
                            ].map((item, idx) => (
                                <div key={item.label} className="flex items-center justify-between py-2 gap-2">
                                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: ['#fb8500','#023047','#2196f3','#43a047','#ff7043','#8e24aa'][idx] }}></span>
                                        {item.label}
                                    </span>
                                    <span className="font-semibold text-gray-900">₱{item.value?.toLocaleString() || '0'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-100">
                            <span className="font-bold text-[#023047] text-sm">Total</span>
                            <span className="font-extrabold text-base text-[#023047]">₱{totalSalary?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Rates Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#023047]/10 p-1.5 rounded-full">
                                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#023047]' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 0V4m0 4v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4' /></svg>
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-[#023047]">Rates</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Last updated: <span className="font-semibold text-gray-600">{formatDate(getRatesInfo?.data?.updatedAt)}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditRatesOpen(true)}
                                className="bg-[#023047] text-white p-1.5 rounded-lg hover:bg-[#fb8500] transition-colors shadow"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 text-sm">
                            {[
                                { label: 'Consumer Cubic Meter Rate', value: getRatesInfo?.data?.consumerCubicMeterRate },
                                { label: 'Mother Meter Cubic Meter Rate', value: getRatesInfo?.data?.motherMeterCubicMeterRate },
                                { label: 'Penalty Rate', value: getRatesInfo?.data?.penaltyRate },
                                { label: 'Subsidy Rate', value: getRatesInfo?.data?.subsidyRate },
                            ].map((item, idx) => (
                                <div key={item.label} className="flex items-center justify-between py-2 gap-2">
                                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: ['#fb8500','#023047','#2196f3','#43a047','#ff7043','#8e24aa'][idx] }}></span>
                                        {item.label}
                                    </span>
                                    <span className="font-semibold text-gray-900">₱{item.value?.toLocaleString() || '0'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <button
                            onClick={() => setAddUserOpen(true)}
                            className="bg-[#fb8500] text-white px-4 py-2 rounded-lg hover:bg-[#fb8500]/90 transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add User
                        </button>
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-center">ID No.</th>
                                    <th 
                                        className="p-3 text-center cursor-pointer group hover:bg-gray-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Name
                                            {filter.sortBy === 'name' && (
                                                filter.sortDir === 'asc' ? 
                                                    <ChevronUpIcon className="w-4 h-4" /> : 
                                                    <ChevronDownIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-3 text-center">Email</th>
                                    <th className="p-3 text-center">Role</th>
                                    <th 
                                        className="p-3 text-center cursor-pointer group hover:bg-gray-100"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Created At
                                            {filter.sortBy === 'createdAt' && (
                                                filter.sortDir === 'asc' ? 
                                                    <ChevronUpIcon className="w-4 h-4" /> : 
                                                    <ChevronDownIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.userId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                                            <td className="p-3 text-center text-gray-900">{user.userId}</td>
                                            <td className="p-3 text-center flex items-center gap-2 justify-center">
                                                <span className="font-semibold text-gray-800">{user.name}</span>
                                            </td>
                                            <td className="p-3 text-center">{user.email}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow border ${
                                                    user.role === 'Admin'
                                                        ? 'bg-green-100 text-green-700 border-green-300'
                                                        : 'bg-blue-100 text-blue-700 border-blue-300'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">{formatDate(user.createdAt)}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="bg-[#fb8500] text-white px-3 py-1 rounded-lg hover:bg-[#023047] transition-colors text-xs font-medium shadow"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.userId)}
                                                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-xs font-medium shadow"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                        <div className="text-sm text-gray-700">
                            Showing {start} to {end} of {total} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(filter.page - 1)}
                                disabled={filter.page <= 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handlePageChange(filter.page + 1)}
                                disabled={filter.page >= totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditSalaryOpen && (
                <EditSalaryModal
                    isOpen={isEditSalaryOpen}
                    onClose={() => setEditSalaryOpen(false)}
                    currentSalary={latestSalaryQuery?.data || {}}
                />
            )}

            {isEditRatesOpen && (
                <EditRatesModal
                    isOpen={isEditRatesOpen}
                    onClose={() => setEditRatesOpen(false)}
                    currentRates={getRatesInfo?.data || {}}
                />
            )}

            {isAddUserOpen && (
                <AddUserModal
                    isOpen={isAddUserOpen}
                    onClose={() => setAddUserOpen(false)}
                />
            )}

            {editProfileOpen && selectedUser && (
                <EditProfileModal
                    user={selectedUser}
                    onClose={() => setEditProfileOpen(false)}
                />
            )}

            <RevertBillsModal
                isOpen={isRevertModalOpen}
                onClose={() => setIsRevertModalOpen(false)}
                onConfirm={handleDeleteBills}
            />

            <ToastModal
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                type={toastConfig.type}
                message={toastConfig.message}
            />
        </div>
    );
}
