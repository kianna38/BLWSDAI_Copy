'use client';

import { useState } from 'react';
import { useDashboardOverview } from '@/hooks/useDashboardOverview';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Automatically imports required components

export default function DashboardPage() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [comparisonYear, setComparisonYear] = useState(currentYear - 1);

    // Fetch dashboard overview data
    const { data, isLoading, error } = useDashboardOverview(currentYear, comparisonYear);

    if (isLoading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Destructure data values for use
    const {
        totalPaymentsThisMonth,
        totalBillsThisMonth,
        totalCollectedMoney,
        totalCollectibles,
        monthlyIncomeThisYear,
        monthlyIncomeLastYear,
        systemLossThisYear,
        systemLossLastYear
    } = data || {}; // Make sure to handle undefined data

    // Check if MonthlyIncomeThisYear exists before using it
    if (!monthlyIncomeThisYear) {
        return <div>Error: Monthly Income data not found</div>;
    }

    // Chart Data Setup for Monthly Income Comparison Graph
    const incomeData = {
        labels: monthlyIncomeThisYear.map(item => item.month), // use 'month' from the object
        datasets: [
            {
                label: `Revenue ${currentYear}`,
                data: monthlyIncomeThisYear.map(item => item.value), // use 'value' from the object
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            },
            {
                label: `Revenue ${comparisonYear}`,
                data: monthlyIncomeLastYear.map(item => item.value), // use 'value' from the object
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            },
        ],
    };

    // Chart Data Setup for Monthly System Loss Comparison Graph
    const systemLossData = {
        labels: systemLossThisYear.map(item => item.month), // use 'month' from the object
        datasets: [
            {
                label: `System Loss ${currentYear}`,
                data: systemLossThisYear.map(item => item.value), // use 'value' from the object
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            },
            {
                label: `System Loss ${comparisonYear}`,
                data: systemLossLastYear.map(item => item.value), // use 'value' from the object
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Header Section */}
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Dashboard</h1>
            </div>

            <div className="p-8 bg-slate-100 text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
                    {/* Total Payments / Active Consumers */}
                    <div className="bg-white p-6 shadow rounded-md">
                        <h3 className="justify-center flex text-lg font-semibold text-gray-800">Month's Bills and Payment Overview</h3>
                        <hr className="border-t-2 border-gray-200 my-4" />
                        <div className="mt-4 flex  justify-between mx-10 items-center">
                            <div className="flex flex-col items-center justify-center">
                                <h4 className="text-gray-600">Bills</h4>
                                <p className="font-bold text-3xl">{totalBillsThisMonth}</p>
                            </div>
                            <div className="flex items-center flex-col">
                                <h4 className="text-gray-600">Payments</h4>
                                <p className="font-bold text-3xl">{totalPaymentsThisMonth}</p>
                            </div>
                        </div>
                        <hr className="border-t-2 border-gray-200 my-4" />
                        <div className="flex flex-col justify-center items-center mx-5 md:justify-between md:flex-row">
                            <h4 className="text-gray-400 ">Unpaid</h4>
                            <p className="font-bold text-xl text-red-600">{totalBillsThisMonth - totalPaymentsThisMonth}</p>
                        </div>
                    </div>

                    {/* Total Collected Money */}
                    <div className="bg-white p-6 shadow rounded-md">
                        <h3 className="justify-center flex text-lg font-semibold text-gray-800">Month's Revenue Overview</h3>
                        <div className="mt-4">
                            <hr className="border-t-2 border-gray-200 my-4" />
                            <div className="flex flex-col items-center justify-center">
                                <h4 className="text-gray-600">Total Money Collected this Month</h4>
                                <p className="font-bold text-3xl text-green-600">₱ {totalCollectedMoney.toLocaleString()}</p>
                            </div>
                            <hr className="border-t-2 border-gray-200 my-4" />
                            <div className="flex flex-col justify-center items-center mx-5 md:justify-between lg:flex-row">
                                <h4 className="text-gray-400 ">Collectibles</h4>
                                <p className={`font-bold text-xl ${totalCollectibles < 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    ₱ {totalCollectibles.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Year Selection for Comparison */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-700">Comparison Year</h4>
                    <select
                        value={comparisonYear}
                        onChange={(e) => setComparisonYear(Number(e.target.value))}
                        className="mt-2 p-2 border rounded-md"
                    >
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear - 2}>{currentYear - 2}</option>
                        <option value={currentYear - 3}>{currentYear - 3}</option>
                        <option value={currentYear - 4}>{currentYear - 4}</option>
                    </select>
                </div>

                {/* Monthly Income Comparison Graph */}
                <div className="bg-white p-6 shadow rounded-md mb-6">
                    <h3 className="flex justify-center text-lg font-semibold">MONTHLY REVENUE COMPARISON GRAPH</h3>
                    <div className="overflow-x-auto">
                        <Line data={incomeData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Monthly System Loss Comparison Graph */}
                <div className="bg-white p-6 shadow rounded-md">
                    <h3 className="flex justify-center text-lg font-semibold">MONTHLY SYSTEM LOSS COMPARISON GRAPH</h3>
                    <div className="overflow-x-auto">
                        <Line data={systemLossData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
