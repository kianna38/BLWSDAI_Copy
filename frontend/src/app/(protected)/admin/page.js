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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Staff Salary</h3>
                                    <p className="text-sm text-gray-500 mt-1">Last updated: {formatDate(latestSalaryQuery?.data?.updatedAt)}</p>
                                </div>
                                <button
                                    onClick={() => setEditSalaryOpen(true)}
                                    className="bg-[#fb8500] text-white p-2 rounded-lg hover:bg-[#fb8500]/90 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">President</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.presidentSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Vice President</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.vicePresidentSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Secretary</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.secretarySalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Treasurer</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.treasurerSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Maintenance 1</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.maintenanceOneSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Maintenance 2</span>
                                    <span className="font-medium text-gray-900">₱{latestSalaryQuery?.data?.maintenanceTwoSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-lg text-gray-900">₱{totalSalary?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rates Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Rates</h3>
                                    <p className="text-sm text-gray-500 mt-1">Last updated: {formatDate(getRatesInfo?.data?.updatedAt)}</p>
                                </div>
                                <button
                                    onClick={() => setEditRatesOpen(true)}
                                    className="bg-[#fb8500] text-white p-2 rounded-lg hover:bg-[#fb8500]/90 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Consumer Cubic Meter Rate</span>
                                    <span className="font-medium text-gray-900">₱{getRatesInfo?.data?.consumerCubicMeterRate?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Mother Meter Cubic Meter Rate</span>
                                    <span className="font-medium text-gray-900">₱{getRatesInfo?.data?.motherMeterCubicMeterRate?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Penalty Rate</span>
                                    <span className="font-medium text-gray-900">₱{getRatesInfo?.data?.penaltyRate?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Subsidy Rate</span>
                                    <span className="font-medium text-gray-900">₱{getRatesInfo?.data?.subsidyRate?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4">
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
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID No.</th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Name
                                                {filter.sortBy === 'name' && (
                                                    filter.sortDir === 'asc' ? 
                                                        <ChevronUpIcon className="w-4 h-4" /> : 
                                                        <ChevronDownIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Created At
                                                {filter.sortBy === 'createdAt' && (
                                                    filter.sortDir === 'asc' ? 
                                                        <ChevronUpIcon className="w-4 h-4" /> : 
                                                        <ChevronDownIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.userId} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.userId}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.createdAt)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="text-[#fb8500] hover:text-[#fb8500]/80"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.userId)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
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
