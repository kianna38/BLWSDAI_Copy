'use client';

import { useState } from 'react';
import { useDashboardOverview } from '@/hooks/useDashboardOverview';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Loading from '@/components/Loading';
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, DocumentTextIcon, UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [comparisonYear, setComparisonYear] = useState(currentYear - 1);

    // Fetch dashboard overview data
    const { data, isLoading, error } = useDashboardOverview(currentYear, comparisonYear);

    if (isLoading) return <Loading />;
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
    } = data || {};

    // Check if MonthlyIncomeThisYear exists before using it
    if (!monthlyIncomeThisYear) {
        return <div>Error: Monthly Income data not found</div>;
    }

    // Chart Data Setup for Monthly Income Comparison Graph
    const incomeData = {
        labels: monthlyIncomeThisYear.map(item => item.month),
        datasets: [
            {
                label: `Revenue ${currentYear}`,
                data: monthlyIncomeThisYear.map(item => item.value),
                borderColor: '#219ebc',
                backgroundColor: 'rgba(33, 158, 188, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#219ebc',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: `Revenue ${comparisonYear}`,
                data: monthlyIncomeLastYear.map(item => item.value),
                borderColor: '#fb8500',
                backgroundColor: 'rgba(251, 133, 0, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fb8500',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    // Chart Data Setup for Monthly System Loss Comparison Graph
    const systemLossData = {
        labels: systemLossThisYear.map(item => item.month),
        datasets: [
            {
                label: `System Loss ${currentYear}`,
                data: systemLossThisYear.map(item => item.value),
                borderColor: '#023047',
                backgroundColor: 'rgba(2, 48, 71, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#023047',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: `System Loss ${comparisonYear}`,
                data: systemLossLastYear.map(item => item.value),
                borderColor: '#ffb703',
                backgroundColor: 'rgba(255, 183, 3, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffb703',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    // Common chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#023047',
                bodyColor: '#023047',
                borderColor: '#e5e5e5',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    callback: function(value) {
                        return '₱' + value.toLocaleString();
                    },
                    font: {
                        size: 11
                    },
                    padding: 10
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    padding: 10
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    const handleBillsAndPaymentsClick = () => {
        router.push('/billings_payment');
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Header Section */}
            <div className="flex p-2 bg-white shadow-inner justify-between items-start mb-2">
                <h1 className="text-2xl font-bold pl-2">Dashboard</h1>
            </div>

            <div className="p-4 bg-slate-100 text-black">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
                    {/* Total Payments / Active Consumers */}
                    <div 
                        onClick={handleBillsAndPaymentsClick}
                        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Month's Bills and Payment Overview</h3>
                            <DocumentTextIcon className="h-8 w-8 text-[#219ebc]" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-gray-600 text-sm font-medium mb-2">Bills</h4>
                                <p className="font-bold text-2xl text-gray-800">{totalBillsThisMonth}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-gray-600 text-sm font-medium mb-2">Payments</h4>
                                <p className="font-bold text-2xl text-gray-800">{totalPaymentsThisMonth}</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-red-50 p-4 rounded-lg">
                            <h4 className="text-red-600 text-sm font-medium mb-1">Unpaid</h4>
                            <p className="font-bold text-xl text-red-600">{totalBillsThisMonth - totalPaymentsThisMonth}</p>
                        </div>
                    </div>

                    {/* Total Collected Money */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Month's Revenue Overview</h3>
                            <CurrencyDollarIcon className="h-8 w-8 text-[#219ebc]" />
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                            <h4 className="text-gray-600 text-sm font-medium mb-2">Total Money Collected this Month</h4>
                            <p className="font-bold text-2xl text-green-600">₱ {totalCollectedMoney.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="text-gray-600 text-sm font-medium mb-2">Collectibles</h4>
                            <p className={`font-bold text-xl ${totalCollectibles < 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                ₱ {totalCollectibles.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Year Selection */}
                <div className="flex justify-end mb-2">
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-700">Comparison Year</h4>
                        <select
                            value={comparisonYear}
                            onChange={(e) => setComparisonYear(Number(e.target.value))}
                            className="p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-[#219ebc] focus:border-[#219ebc] outline-none"
                        >
                            <option value={currentYear - 1}>{currentYear - 1}</option>
                            <option value={currentYear - 2}>{currentYear - 2}</option>
                            <option value={currentYear - 3}>{currentYear - 3}</option>
                            <option value={currentYear - 4}>{currentYear - 4}</option>
                        </select>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly System Loss Comparison Graph */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-6">MONTHLY SYSTEM LOSS COMPARISON</h3>
                        <div className="h-[350px]">
                            <Line data={systemLossData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Monthly Income Comparison Graph */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-6">MONTHLY REVENUE COMPARISON</h3>
                        <div className="h-[350px]">
                            <Line data={incomeData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
