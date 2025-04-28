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
        const monthYear = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString(); // 🔥 First day of current month

        const confirmDelete = window.confirm("Are you sure you want to delete the bills?");
        if (confirmDelete) {
            deleteBillsMutation.mutate(monthYear, {
                onSuccess: () => {
                    alert('Bills deleted successfully!');
                },
                onError: (error) => {
                    if (error?.response?.status === 400) {
                        alert('Cannot delete bills because there are associated payments.');
                    } else {
                        alert('Error deleting bills.');
                    }
                }
            });
        }
    };


    const handleDelete = (userId) => {
        console.log(userId);
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            deleteUserMutation.mutate(userId);  // Ensure only the user ID is passed
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user); // Set the selected user for editing
        setEditProfileOpen(true); // Open the edit profile modal
    };

    if (usersLoading) return <div>Loading...</div>;

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-4 bg-white shadow-md justify-between items-center">
                <h1 className="text-2xl font-bold">Admin</h1>
                <button
                    onClick={() => handleDeleteBills()}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                    Revert This Month's Generated Bill
                </button>
            </div>

            <div className="flex flex-col p-6 space-y-6">

                <div className="flex justify-center mt-6 space-x-5 md:space-y-0 space-y-5 md:flex-row flex-col">
                    <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 ">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Staff Salary</h3>
                                <p className="text-sm font-light text-slate-500">{formatDate(latestSalaryQuery?.data?.updatedAt)} </p>
                            </div>
                            <button
                                onClick={() => setEditSalaryOpen(true)}
                                className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2 h-fit"
                            >
                                <PencilIcon className="w-4 h-5 text-white" /> Edit Salary
                            </button>
                        </div>
                        <div className="flex justify-center flex-col mx-5">
                            <div className="flex justify-between mt-2">
                                <p className="text-left">President:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.presidentSalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Vice President:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.vicePresidentSalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Secretary:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.secretarySalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Treasurer:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.treasurerSalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Maintenance 1:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.maintenanceOneSalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Maintenance 2:</p>
                                <p className="text-right">₱ {latestSalaryQuery?.data?.maintenanceTwoSalary}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left font-bold">Total:</p>
                                <p className="text-right font-bold">₱ {totalSalary}</p>
                            </div>
                        </div>

                    </div>

                    <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Rates</h3>
                                <p className="text-sm font-light text-slate-500">{formatDate(getRatesInfo?.data?.updatedAt)} </p>
                            </div>
                            <button
                                onClick={() => setEditRatesOpen(true)}
                                className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2 h-fit"
                            >
                                <PencilIcon className="w-4 h-5 text-white" /> Edit Rates
                            </button>
                        </div>
                        <div className="flex justify-center flex-col mx-5 h-2/3">
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Consumer Cubic Meter Rate:</p>
                                <p className="text-right">₱ {getRatesInfo?.data?.consumerCubicMeterRate}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Mother Meter Cubic Meter Rate:</p>
                                <p className="text-right">₱ {getRatesInfo?.data?.motherMeterCubicMeterRate}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Penalty Rate:</p>
                                <p className="text-right">₱ {getRatesInfo?.data?.penaltyRate}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-left">Subsidy Rate:</p>
                                <p className="text-right">₱ {getRatesInfo?.data?.subsidyRate}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center flex-col space-y-5 md:space-y-0 md:flex-row">
                    <div>
                        <button
                            onClick={() => setAddUserOpen(true)}
                            className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-5 text-white" />Add User
                        </button>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-cyan-400" />
                            <input
                                type="text"
                                placeholder="Search Users"
                                className="pl-8 bg-cyan-50 p-2 rounded shadow"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-cyan-50 rounded-lg w-full overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-left text-slate-700 ">
                        <thead className="bg-cyan-100 uppercase text-gray-500 font-medium">


                            {/* Header row for larger screens */}
                            <tr className="text-center">
                                <th className="px-4 py-2">ID No.</th>
                                <th
                                    className="p-3 text-center cursor-pointer select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Name</span>
                                        {filter.sortBy === 'name' ? (
                                            filter.sortDir === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>
                                <th className="p-3 text-center ">Email</th>
                                <th className="p-3 text-center ">User Role</th>
                                <th
                                    className="p-3 text-center cursor-pointer select-none"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Created At</span>
                                        {filter.sortBy === 'createdAt' ? (
                                            filter.sortDir === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                <th className="p-3 text-center pr-1">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.userId} className="border-t border-b border-cyan-200 text-center">

                                    {/* Larger screen columns */}
                                    <td className="px-4 py-2">{user.userId}</td>
                                    <td className="p-3 text-center ">{user.name}</td>
                                    <td className="p-3 text-center ">{user.email}</td>
                                    <td className="p-3 text-center ">{user.role}</td>
                                    <td className="p-3 text-center ">{formatDate(user.createdAt)}</td>
                                    <td className="p-3 text-center ">
                                        <div className="flex justify-center space-x-2 flex-col space-y-1">
                                            <button onClick={() => handleEdit(user)} className="bg-blue-500 w-full text-white px-2 py-1 rounded hover:bg-blue-700">Edit</button>
                                            <button onClick={() => handleDelete(user.userId)} className="bg-red-500 w-full text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-3">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>




                    <div className="p-4 flex justify-end space-x-5 items-center text-sm text-gray-600">
                        <div>
                            Rows per page: {filter.pageSize} | {start}-{end} of {total}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(filter.page - 1)}
                                disabled={filter.page <= 1}
                                className="px-3 py-1 border rounded disabled:opacity-30"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handlePageChange(filter.page + 1)}
                                disabled={filter.page >= totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-30"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>



            </div>

            {/* Modal for Salary Edit */}
            {isEditSalaryOpen && (
                <EditSalaryModal
                    isOpen={isEditSalaryOpen}
                    onClose={() => setEditSalaryOpen(false)}
                    currentSalary={latestSalaryQuery?.data || {}}
                />
            )}

            {/* Modal for Rates Edit */}
            {isEditRatesOpen && (
                <EditRatesModal
                    isOpen={isEditRatesOpen}
                    onClose={() => setEditRatesOpen(false)}
                    currentRates={getRatesInfo?.data || {}}
                />
            )}

            {/* Modal for Add User */}
            {isAddUserOpen && (
                <AddUserModal
                    isOpen={isAddUserOpen}
                    onClose={() => setAddUserOpen(false)}
                />
            )}

            {/* Edit Profile Modal */}
            {editProfileOpen && selectedUser && (
                <EditProfileModal
                    user={selectedUser} // Pass the selected user to the modal
                    onClose={() => setEditProfileOpen(false)} // Close modal when user is done editing
                />
            )}
        </div>
    );
}
