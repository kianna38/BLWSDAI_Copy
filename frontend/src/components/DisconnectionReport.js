"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { useGeneralDisconnectionReport } from "@/hooks/useReportSummary";

export default function DisconnectionReport() {
    const today = new Date();
    const defaultMonth = today.toISOString().slice(0, 7);
    const [monthYear, setMonthYear] = useState(defaultMonth);
    const router = useRouter();

    const { data: genReport, isLoading: genReportIsLoading, isError: genReportError } = useGeneralDisconnectionReport(monthYear);

    const printRef = useRef();

    const handlePrintReport = useReactToPrint({
        documentTitle: `DisconnectionReport-${monthYear}`,
        contentRef: printRef,
    });

    const handleRowClick = (consumerId) => {
        router.push(`/report/subject_for_disconnection/?consumerId=${consumerId}`);
    };

    // Format month and year for display
    const formatMonthYear = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    if (genReportIsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fb8500]"></div>
            </div>
        );
    }

    if (genReportError) {
        return (
            <div className="p-8 text-center text-red-600">
                Error loading data. Please  try again later.
            </div>
        );
    }

    console.log(genReport.consumer);

    return (
        <div className="space-y-6">
            {/* Header with Date Picker */}
            <div className="bg-white p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-black">
                        Disconnection Report
                    </h2>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-black">Month:</label>
                        <input
                            type="month"
                            value={monthYear}
                            onChange={(e) => setMonthYear(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div ref={printRef} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Print Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-black text-center mb-2">
                        Subject for Disconnection
                    </h1>
                    <p className="text-lg text-black text-center">
                        {formatMonthYear(monthYear)}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-black font-medium">Name</th>
                                <th className="px-6 py-3 text-black font-medium">Purok</th>
                                <th className="px-6 py-3 text-black font-medium">Meter No.</th>
                                <th className="px-6 py-3 text-right text-black font-medium">Balance with Penalty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {genReport.map((consumer, index) => (
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(consumer.consumerId)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-black">
                                        {consumer.lastName}, {consumer.firstName}
                                    </td>
                                    <td className="px-6 py-4 text-black">
                                        {consumer.purok.replace("_", "")}
                                    </td>
                                    <td className="px-6 py-4 text-black">
                                        {consumer.meterNumber}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-600">
                                        ₱{consumer.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-end">
                <button
                    onClick={handlePrintReport}
                    className="inline-flex items-center gap-2 bg-[#fb8500] text-white px-6 py-2 rounded-md hover:bg-[#fb8500]/90 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                </button>
            </div>
        </div>
    );
}
