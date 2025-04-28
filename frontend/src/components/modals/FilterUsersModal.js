import React, { useState, useEffect } from 'react';

const FilterUsersModal = ({ filter, setFilter, onClose }) => {
    return (
        <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Filter Users</h3>

                {/* Roles Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                        value={filter.roles.length ? filter.roles[0] : 'All'}
                        onChange={(e) => setFilter((prev) => ({
                            ...prev,
                            roles: e.target.value === 'All' ? [] : [e.target.value],  // Roles should be an array
                            page: 1  // Reset page to 1 when changing filter
                        }))}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        <option value="All">All</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>

                {/* Sort By Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                        value={filter.sortBy}
                        onChange={(e) => setFilter((prev) => ({
                            ...prev,
                            sortBy: e.target.value,
                            page: 1  // Reset page to 1 when changing sort criteria
                        }))}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        <option value="name">Name</option>
                        <option value="createdAt">Created At</option>
                    </select>
                </div>

                {/* Sort Direction Filter */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Sort Direction</label>
                    <select
                        value={filter.sortDir}
                        onChange={(e) => setFilter((prev) => ({
                            ...prev,
                            sortDir: e.target.value,
                            page: 1  // Reset page to 1 when changing sort direction
                        }))}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose} // Close the modal
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterUsersModal;
