"use client";

import { useState } from "react";
import IncomeReport from "@/components/IncomeReport";
import DisconnectionReport from "@/components/DisconnectionReport";

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("income");

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("income")}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === "income"
                                    ? "border-[#023047] text-[#023047]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            Income Report
                        </button>
                        <button
                            onClick={() => setActiveTab("disconnection")}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === "disconnection"
                                    ? "border-[#023047] text-[#023047]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            Disconnection Report
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === "income" ? <IncomeReport /> : <DisconnectionReport />}
                </div>
            </div>
        </div>
    );
}
