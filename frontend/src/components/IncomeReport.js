"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useCreateOtherExpense, useUpdateOtherExpense, useDeleteOtherExpense } from "@/hooks/useOtherExpenses";
import { useIncomeReport } from "@/hooks/useReportSummary";
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state

export default function IncomeReport() {
    const today = new Date();
    const defaultMonth = today.toISOString().slice(0, 7); // "2025-04"
    const [fromDate, setFromDate] = useState(defaultMonth);
    const [toDate, setToDate] = useState(defaultMonth);

    const { userId } = useAuthStore(state => state);

    const { createExpensesMutation } = useCreateOtherExpense();
    const { updateExpensesMutation } = useUpdateOtherExpense();
    const { deleteExpensesMutation } = useDeleteOtherExpense();
    const { data: incomeData, isLoading, isError } = useIncomeReport(fromDate, toDate);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");

    const incomeReportPrint = useRef(null);

    const handlePrintIncomeReport = useReactToPrint({
        documentTitle: 'IncomeReport',
        contentRef: incomeReportPrint,
    });


    if (isLoading) {
        return <div className="p-5">Loading...</div>;
    }

    if (isError) {
        return <div className="p-5">Error loading data</div>;
    }

    const openCreateModal = () => {
        setLabel("");
        setAmount("");
        setIsEditMode(false);
        setShowModal(true);
    };

    const openEditModal = (expense) => {
        setLabel(expense.label);
        setAmount(expense.amount);
        setSelectedExpenseId(expense.expenseId);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleSaveExpense = () => {
        if (!label || !amount) return; // Optional: basic validation

        const input = {
            label,
            amount: parseFloat(amount),
            date: new Date(),
            userId,
        };

        if (isEditMode) {
            updateExpensesMutation.mutate({
                id: selectedExpenseId,
                updatedData: input,
            });
        } else {
            createExpensesMutation.mutate(input);
        }

        setShowModal(false);
    };


    const handleDeleteExpense = () => {
        if (!selectedExpenseId) return;

        deleteExpensesMutation.mutate(selectedExpenseId, {
            onSuccess: () => {
                setShowModal(false); // Close modal after deleting
            },
            onError: (error) => {
                console.error("Failed to delete expense:", error);
            },
        });
    };



    return (
        <div className="space-y-6">
            {/* Non-printable Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-black">From:</label>
                        <input
                            type="month"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-black">To:</label>
                        <input
                            type="month"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                        />
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 bg-[#fb8500] text-white px-4 py-2 rounded-md hover:bg-[#fb8500]/90 transition-colors text-sm font-medium"
                >
                    <span className="text-lg">＋</span> Add Other Expenses
                </button>
            </div>

            {/* Printable Content */}
            <div ref={incomeReportPrint} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Income Summary Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Collected Money</span>
                            <span className="font-semibold text-green-600">₱{incomeData.totalCollectedMoney?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Mother Meter Bill</span>
                            <span className="font-semibold text-red-600">₱{incomeData.motherMeterBill?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Staff Salary</span>
                            <span className="font-semibold text-red-600">₱{incomeData.staffSalary?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Other Expenses</span>
                            <span className="font-semibold text-red-600">₱{incomeData.otherExpenses?.toLocaleString()}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-medium">Total Monthly Income</span>
                                <span className={`font-bold text-lg ${
                                    incomeData.totalIncome > 0
                                        ? "text-green-600"
                                        : incomeData.totalIncome < 0
                                            ? "text-red-600"
                                            : "text-gray-900"
                                }`}>
                                    ₱{incomeData.totalIncome?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Salary Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Salary</h3>
                    <div className="space-y-3">
                        {incomeData.staffSalaryList?.map((staff, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-black">{staff.position}</span>
                                <span className="font-medium text-black">₱{staff.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-black">Total</span>
                                <span className="font-bold text-black">₱{incomeData.staffSalary?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Expenses Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Expenses</h3>
                    <div className="space-y-3">
                        {incomeData.otherExpensesList?.map((expense, index) => (
                            <div
                                key={index}
                                onClick={() => openEditModal(expense)}
                                className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <span className="text-black">{expense.label}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-black">₱{expense.amount.toLocaleString()}</span>
                                    <span className="text-sm text-black">{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-black">Total</span>
                                <span className="font-bold text-black">₱{incomeData.otherExpenses?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Non-printable Print Button */}
            <div className="flex justify-end">
                <button
                    onClick={handlePrintIncomeReport}
                    className="inline-flex items-center gap-2 bg-[#fb8500] text-white px-6 py-2 rounded-md hover:bg-[#fb8500]/90 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 space-y-4 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Edit Expense" : "Add Expense"}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Label</label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            {isEditMode && (
                                <button
                                    onClick={handleDeleteExpense}
                                    className="px-4 py-2 text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-md transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveExpense}
                                className="px-4 py-2 bg-[#fb8500] text-white rounded-md hover:bg-[#fb8500]/90 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
