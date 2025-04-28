"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useIndividualDisconnectionReport, notifyIndvDisconnection } from "@/hooks/useReportSummary";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DisconnectionReport() {
    const searchParams = useSearchParams();
    const consumerId = searchParams.get('consumerId');
    const router = useRouter();

    const { data: indvReport, isLoading: indvReportIsLoading, isError: indvReportError } = useIndividualDisconnectionReport(consumerId);
    const { notifyDisconnectionMutation } = notifyIndvDisconnection();

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
            <div className="flex  p-2 bg-white shadow-inner justify-between items-center">
                <div className="flex sm:flex-row flex-col ">
                    <Link href="/report">
                        <h1 className="text-2xl font-bold pl-2 cursor-pointer hover:text-blue-500 hover:underline">
                            Reports
                        </h1>
                    </Link>
                    <h1 className="text-2xl font-bold pl-2">- {indvReport.firstName} {indvReport.lastName}</h1>
                </div>
                <div className="flex space-x-2 md:flex-row flex-col">
                    <button
                        className="justify-center bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-700 flex items-center gap-2 "
                        onClick={handleNotify}
                    >
                        Send Disconnection Notice
                    </button>
                    <button
                        className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        onClick={handlePrintReport}
                    >
                        Print Report
                    </button>
                </div>

            </div>

            {/* Printable Content */}
            <div ref={printRef} className="m-5 p-6 bg-white rounded-md shadow-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Subject For Disconnection Report</h2>
                    <h2 className="text-xl font-bold">{indvReport.firstName} {indvReport.lastName}</h2>
                    <p className="text-sm mt-1">{new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>

                {/* Consumer Details */}
                <div className="mb-8 px-4 space-y-1 text-sm">
                    <p><span className="font-semibold">Meter Serial:</span> {indvReport.meterSerial}</p>
                    <p><span className="font-semibold">Purok:</span> {indvReport.purok.replace("_", "")}</p>
                    <p><span className="font-semibold">Email:</span> {indvReport.email || "N/A"}</p>
                    <p><span className="font-semibold">Contact Number:</span> {indvReport.phoneNumber || "N/A"}</p>
                    <p><span className="font-semibold">Notif Preference:</span> {formatNotification(indvReport.notificationPreference)}</p>
                    <p><span className="font-semibold">Total Balance:</span> Php {indvReport.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Bills Table */}
                <div className="bg-cyan-50 rounded-lg shadow-sm overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-700 ">
                        <thead className="bg-cyan-100 text-gray-500">
                            <tr className="text-center">
                                <th className="px-6 py-3 ">Billing Month</th>
                                <th className="px-6 py-3 ">Cubic Used</th>
                                <th className="px-6 py-3 ">Total Amount</th>
                                <th className="px-6 py-3 ">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indvReport.bills?.map((bill, index) => (
                                <tr key={index}
                                    className="border-t border-b border-cyan-200  text-center">
                                    <td className="px-6 py-4">{bill.billingMonth}</td>
                                    <td className="px-6 py-4 text-cyan-600 font-semibold">{bill.cubicUsed} m3</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">₱{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${bill.status.toLowerCase() === "overdue"
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
    );
}
