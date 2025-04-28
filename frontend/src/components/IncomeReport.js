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
        <div className="p-5 flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Income Report</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition"
                >
                    <span className="text-lg">＋</span> Add Other Expenses
                </button>
            </div>

            {/* Date Picker and Generate */}
            <div className="flex flex-wrap justify-center items-center gap-4">
                <label className="flex items-center gap-2 font-medium">
                    FROM
                    <input
                        type="month"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </label>

                <label className="flex items-center gap-2 font-medium">
                    TO
                    <input
                        type="month"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </label>

            </div>

            {/* Main Income Report Summary */}
            <div ref={incomeReportPrint} className="border border-slate-300 p-5 rounded space-y-5 shadow-lg">

                <div className="border border-slate-300 p-6 rounded-md shadow">
                    <h3 className="text-lg font-bold text-center mb-2">Income Report</h3>
                    <p className="text-center mb-6">
                        {new Date(fromDate).toLocaleString('default', { month: 'long', year: 'numeric' })} to{" "}
                        {new Date(toDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>

                    <div className="space-y-2 mx-2 md:mx-8">
                        <div className="flex justify-between">
                            <span>Total Collected Money:</span>
                            <span className="font-semibold text-green-400">Php {incomeData.totalCollectedMoney?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Mother Meter Bill:</span>
                            <span className="font-semibold text-red-400">Php {incomeData.motherMeterBill?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Staff Salary:</span>
                            <span className="font-semibold text-red-400">Php {incomeData.staffSalary?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Other Expenses:</span>
                            <span className="font-semibold text-red-400">Php {incomeData.otherExpenses?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between font-bold pt-4">
                            <span>Total Monthly Income:</span>
                            <span
                                className={`font-semibold ${incomeData.totalIncome > 0
                                        ? "text-green-500"
                                        : incomeData.totalIncome < 0
                                            ? "text-red-600"
                                            : "text-black"
                                    }`}
                            >
                                Php {incomeData.totalIncome?.toLocaleString()}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Staff Salary and Other Expenses Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Staff Salary */}
                    <div className="border border-slate-300 p-6 rounded-md shadow">
                        <h3 className="text-lg font-bold mb-2 text-center">Staff Salary</h3>
                        <p className="text-center text-sm mb-4 text-gray-500">Last Update: {new Date().toLocaleDateString()}</p>
                        <div className="space-y-2">
                            {incomeData.staffSalaryList?.map((staff, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>{staff.position}:</span>
                                    <span>Php {staff.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="font-semibold border-t mt-2 pt-2 flex justify-between">
                                <span>Total:</span>
                                <span>Php {incomeData.staffSalary?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Other Expenses */}
                    <div className="border border-slate-300 p-6 rounded-md shadow">
                        <h3 className="text-lg font-bold mb-2 text-center">Other Expenses</h3>
                        <div className="space-y-2">
                            {incomeData.otherExpensesList?.map((expense, index) => (
                                //clicking opens the edit expense
                                <div
                                    key={index}
                                    className="flex justify-between text-sm cursor-pointer hover:bg-slate-100 py-1 px-2 rounded"
                                    onClick={() => openEditModal(expense)}
                                >
                                    <span>{expense.label}:</span>
                                    <div className="flex gap-4">
                                        <span>Php {expense.amount.toLocaleString()}</span>
                                        <span className="text-gray-500">{new Date(expense.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="font-semibold border-t mt-2 pt-2 flex justify-between">
                                <span>Total:</span>
                                <span>Php {incomeData.otherExpenses?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Download PDF Button */}
            <div className="flex justify-end">
                <button
                    onClick={handlePrintIncomeReport}
                    className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
                >
                    Print Report
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 space-y-4 shadow-lg">
                        <h2 className="text-xl font-bold">{isEditMode ? "Edit Expense" : "Add Expense"}</h2>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Label</label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div className="flex justify-between gap-3 pt-4">

                            {isEditMode && (
                                <button
                                    onClick={handleDeleteExpense}
                                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            )}
                            <div className="space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveExpense}
                                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    {isEditMode ? "Update" : "Save"}
                                </button>
                            </div>
                            

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
