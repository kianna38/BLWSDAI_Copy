"use client";

import { useState } from "react";
import IncomeReport from "@/components/IncomeReport";
import DisconnectionReport from "@/components/DisconnectionReport";

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState("income");

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Reports</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b-4 border-blue-500 mt-6 mx-6 ">
                <button
                    className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === "income"
                            ? "border-b-4 border-blue-500 text-white bg-blue-500"
                            : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("income")}
                >
                    Income Report
                </button>
                <button
                    className={`px-4 py-2 font-semibold ml-4 rounded-t-lg  ${activeTab === "disconnection"
                            ? "border-b-4 border-blue-500 text-white bg-blue-500"
                            : "text-gray-600 border-t border-l border-r"
                        }`}
                    onClick={() => setActiveTab("disconnection")}
                >
                    Disconnection Report
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-lg shadow-md mx-6">
                {activeTab === "income" ? <IncomeReport /> : <DisconnectionReport />}
            </div>
        </div>
    );
}
