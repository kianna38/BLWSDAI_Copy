"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { useGeneralDisconnectionReport } from "@/hooks/useReportSummary";

export default function DisconnectionReport() {
    const today = new Date();
    const defaultMonth = today.toISOString().slice(0, 7); // "2025-04"
    const [monthYear, setMonthYear] = useState(defaultMonth);
    const router = useRouter();

    const { data: genReport, isLoading: genReportIsLoading, isError: genReportError } = useGeneralDisconnectionReport(monthYear);

    const printRef = useRef();

    const handlePrintReport = useReactToPrint({
        documentTitle: `DisconnectionReport-${monthYear}`,
        contentRef: printRef,
    });

    // Handle row click for navigation
    const handleRowClick = (consumerId) => {
        router.push(`/report/subject_for_disconnection/?consumerId=${consumerId}`);
    };

    if (genReportIsLoading) {
        return <div className="p-5">Loading...</div>;
    }

    if (genReportError) {
        return <div className="p-5">Error loading data</div>;
    }

    return (
        <div className="p-5 flex flex-col gap-6">
            {/* Printable Content */}
            <div ref={printRef} className="border rounded-md shadow p-6">
                <h2 className="text-xl font-bold text-center mb-6">
                    Disconnection Report as of {new Date(monthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>

                <div className="bg-cyan-50 rounded-lg overflow-x-auto  shadow-sm">
                    <table className="w-full text-sm text-left text-slate-700">
                        <thead className="bg-cyan-100 text-gray-500">
                            <tr className="text-center">
                                <th className="px-6 py-3 ">Name</th>
                                <th className="px-6 py-3 ">Purok</th>
                                <th className="px-6 py-3 ">Meter No.</th>
                                <th className="px-6 py-3 ">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {genReport.map((consumer, index) => (
                                <tr key={index}
                                    onClick={() => handleRowClick(consumer.consumerId)}
                                    className="border-t border-b border-cyan-200 hover:bg-cyan-200 text-center">
                                    <td
                                        className="px-6 py-4">
                                        {consumer.lastName}, {consumer.firstName}
                                    </td>
                                    <td className="px-6 py-4">{consumer.purok.replace("_", "")}</td>
                                    <td className="px-6 py-4">{consumer.meterNumber}</td>
                                    <td className="px-6 py-4">Php {consumer.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                    className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
                >
                    Print Report
                </button>
            </div>
        </div>
    );
}
