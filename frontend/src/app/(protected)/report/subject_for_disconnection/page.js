"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useIndividualDisconnectionReport, notifyIndvDisconnection } from "@/hooks/useReportSummary";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ToastModal from '@/components/modals/ToastModal';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function DisconnectionReport() {
    const searchParams = useSearchParams();
    const consumerId = searchParams.get('consumerId');
    const router = useRouter();

    const { data: indvReport, isLoading: indvReportIsLoading, isError: indvReportError } = useIndividualDisconnectionReport(consumerId);
    const { notifyDisconnectionMutation, isToastOpen, setIsToastOpen, toastConfig } = notifyIndvDisconnection();

    const printRef = useRef();

    const handlePrintReport = useReactToPrint({
        documentTitle: `DisconnectionReport-${indvReport?.lastName}`,
        contentRef: printRef,
    });

    const handleNotify = () => {
        if (consumerId) {
            notifyDisconnectionMutation.mutate(consumerId);
        }
    };


    if (indvReportIsLoading) {
        return <div className="p-5">Loading...</div>;
    }

    if (indvReportError) {
        return <div className="p-5">Error loading data</div>;
    }

    const formatNotification = (notifPref) => {
        if (!notifPref) return "";
        return notifPref.replace(/_/g, " ").replace(/SMS/g, "SMS").replace(/Email/g, "Email");
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Top Bar */}
            <div className="flex p-4 bg-white shadow-md justify-between items-center">
                <div className="flex items-center">
                    <Link href="/report" className="flex items-center group">
                        <ArrowLeftIcon className="w-6 h-6 text-[#fb8500] group-hover:-translate-x-1 transition mr-1" />
                        <h1 className="text-2xl font-bold pl-2 cursor-pointer group-hover:text-[#fb8500] hover:underline">
                            Reports
                        </h1>
                    </Link>
                    <h1 className="text-2xl font-bold pl-2">- {indvReport.firstName} {indvReport.lastName}</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
                        onClick={handleNotify}
                    >
                        Send Disconnection Notice
                    </button>
                    <button
                        className="bg-[#023047] text-white px-4 py-2 rounded-lg hover:bg-[#fb8500] flex items-center gap-2 transition"
                        onClick={handlePrintReport}
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="m-5 p-6 bg-white rounded-xl shadow-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#023047]">Subject For Disconnection Report</h2>
                    <h2 className="text-xl font-bold text-gray-700 mt-2">{indvReport.firstName} {indvReport.lastName}</h2>
                    <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>

                {/* Consumer Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Meter Serial</p>
                            <p className="font-medium text-gray-800">{indvReport.meterSerial}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Purok</p>
                            <p className="font-medium text-gray-800">{indvReport.purok.replace("_", "")}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Email</p>
                            <p className="font-medium text-gray-800">{indvReport.email || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Contact Number</p>
                            <p className="font-medium text-gray-800">{indvReport.phoneNumber || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Notification Preference</p>
                            <p className="font-medium text-gray-800">{formatNotification(indvReport.notificationPreference)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Total Balance</p>
                            <p className="font-bold text-red-600 text-lg">₱{indvReport.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                {/* Bills Table */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-[#023047]">Billing Information</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3 text-center">Billing Month</th>
                                    <th className="px-6 py-3 text-center">Cubic Used</th>
                                    <th className="px-6 py-3 text-center">Total Amount</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {indvReport.bills?.map((bill, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center">{bill.billingMonth}</td>
                                        <td className="px-6 py-4 text-center text-cyan-600 font-semibold">{bill.cubicUsed} m³</td>
                                        <td className="px-6 py-4 text-center text-green-600 font-semibold">₱{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${
                                                bill.status.toLowerCase() === "overdue"
                                                    ? "text-red-500"
                                                    : bill.status.toLowerCase() === "partial"
                                                        ? "text-orange-500"
                                                        : "text-black"
                                            }`}>
                                                {bill.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ToastModal
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                type={toastConfig.type}
                message={toastConfig.message}
            />
        </div>
    );
}
