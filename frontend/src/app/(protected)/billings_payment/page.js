'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import { useBillsByMonthYear } from '@/hooks/useBill'; // Filter consumers
import { useFilterConsumers } from '@/hooks/useConsumer'; // Filter consumers
import { useMotherMeterReadings, useSystemLoss } from '@/hooks/useMotherMeter'; // Get all mother meter readings

export default function BillingsAndPaymentPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date();
    const initialMonthYear = `${today.getFullYear()} ${today.toLocaleString('default', { month: 'long' })}`;

    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);


    const { readingsQuery } = useMotherMeterReadings(); // Fetch all mother meter readings
    const { getMonthBills } = useBillsByMonthYear(selectedMonthYear, page, pageSize);
    const { data: consumerData, isLoading: consumerLoading } = useFilterConsumers({ status: 'Active', pageSize: 500 });

    // Filter the consumer data based on the search query
    const filteredConsumers = useMemo(() => {
        if (!searchQuery) return consumerData?.data || [];
        return consumerData?.data.filter(consumer => {
            const fullName = `${consumer.firstName} ${consumer.lastName}`.toLowerCase();
            const purok = consumer.purok?.toLowerCase() || '';
            return fullName.includes(searchQuery.toLowerCase()) || purok.includes(searchQuery.toLowerCase());
        }) || [];
    }, [consumerData, searchQuery]);

    // Filter readings based on matching consumerId
    const filteredBills = useMemo(() => {
        if (!getMonthBills?.data?.data || filteredConsumers.length === 0) return [];
        return getMonthBills.data.data.filter(reading =>
            filteredConsumers.some(consumer => consumer.consumerId === reading.consumerId)
        );
    }, [getMonthBills?.data?.data, filteredConsumers]);



    if (getMonthBills.isLoading || consumerLoading) return <div>Loading...</div>;
    if (getMonthBills.isError) return <div>Error loading bills...</div>;

    // Extract available months from the fetched mother meter readings
    // what to do if there is the bills were not yet generated for the current reading month? 
    const availableMonths = readingsQuery?.data?.map((reading) => {
        const monthYear = new Date(reading.monthYear);
        const year = monthYear.getFullYear();
        const month = monthYear.toLocaleString('default', { month: 'long' }); // Full month name like January, February, etc.
        return `${year} ${month}`;
    }) || [];


    // Remove duplicates
    const uniqueAvailableMonths = [...new Set(availableMonths)];


    // Extract necessary data from queries
    const bills = getMonthBills.data?.data || [];

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
    };

    // Handle row click for navigation
    const handleRowClick = (consumerId, monthYear) => {
        router.push(`/billings_payment/bill_pay/?consumerId=${consumerId}&monthYear=${monthYear}`);
    };


    // Handle pagination (previous and next page)
    const handleNextPage = () => {
        if (page * pageSize < getFilteredReading.data?.totalCount) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    console.log(bills);

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Billings and Payment</h1>
            </div>
            <div className="flex flex-col m-5  mb-10">
                <div className="flex flex-col justify-between items-center mb-5 md:flex-row">
                    <div className="">
                        <label htmlFor="monthYear" className="text-lg font-semibold">Date</label>
                        <select
                            id="monthYear"
                            value={selectedMonthYear}
                            onChange={handleMonthYearChange}
                            className="ml-2 border rounded-md p-2 h-fit"
                        >
                            {uniqueAvailableMonths.map((monthYear) => (
                                <option key={monthYear} value={monthYear}>
                                    {monthYear} {/* Display in yyyy-mm format */}
                                </option>
                            ))}
                        </select>

                    </div>
                    <div className="flex justify-end space-x-5 items-center ">
                        <div className="relative">

                                <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-cyan-400" />
                                <input
                                    type="text"
                                    placeholder="Search Purok or Name"
                                    className="placeholder:text-sm pl-8 bg-cyan-50 p-2 rounded shadow"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                        </div>
                    </div>
                </div>

                {/* Consumer Readings Table */}
                <div className="flex flex-col  space-y-6">
                    <div className="bg-cyan-50 rounded-lg  shadow-sm">

                        <table className="w-full text-sm text-left text-slate-700  overflow-x-auto ">
                            <thead className="bg-cyan-100 uppercase text-gray-500 font-medium">
                                {/* Header row for mobile */}
                                <tr className="md:hidden">
                                    <th className="p-3 text-center flex flex-col">
                                        Bills Info
                                    </th>
                                </tr>

                                {/* Header row for larger screens */}
                                <tr className="hidden md:table-row">
                                    <th className="p-3 w-1/11 text-center">Purok</th>
                                    <th className="p-3 w-2/11 text-center">Name</th>
                                    <th className="p-3 w-2/11 text-center">Amount</th>
                                    <th className="p-3 w-2/11 text-center">Balance</th>
                                    <th className="p-3 w-2/11 text-center">Total Amount</th>
                                    <th className="p-3 w-2/11 text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBills.map((bill, index) => {
                                    const consumer = consumerData.data.find(consumer => consumer.consumerId === bill.consumerId);

                                    return (
                                        <tr key={index}
                                            onClick={() => handleRowClick(consumer.consumerId, bill.monthYear)}
                                            className="border-t border-b border-cyan-200 hover:bg-cyan-200 text-center"
                                        >

                                            {/* Mobile view */}
                                            <td className="md:hidden p-3">
                                                <div className="flex flex-col space-y-2 mx-5">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Purok:</span>
                                                        <span>{consumer?.purok.replace('_', ' ') || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Name:</span>
                                                        <span>{consumer ? `${consumer.lastName}, ${consumer.firstName}` : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Amount:</span>
                                                        <span>₱ {bill.totalAmount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Balance:</span>
                                                        <span>₱ {bill.balance}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Total Amount:</span>
                                                        <span>₱ {bill.totalAmount + bill.balance}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Status:</span>
                                                        <span className={
                                                            bill.status === 'Paid'
                                                                ? 'text-green-600 font-semibold'
                                                                : bill.status === 'Partial'
                                                                    ? 'text-yellow-500 font-semibold'
                                                                    : 'text-red-600 font-semibold'
                                                        }>
                                                            {bill.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>


                                            {/* Desktop view */}
                                            <td className="hidden md:table-cell p-3 text-center">{consumer?.purok.replace('_', ' ') || 'N/A'}</td>
                                            <td className="hidden md:table-cell p-3 text-center font-bold">{consumer ? `${consumer.lastName}, ${consumer.firstName}` : 'N/A'}</td>
                                            <td className="hidden md:table-cell p-3 text-center text-sky-500">₱ {bill.totalAmount}</td>
                                            <td className="hidden md:table-cell p-3 text-center text-red-500">₱ {bill.balance}</td>
                                            <td className="hidden md:table-cell p-3 text-center text-green-500">₱ {bill.totalAmount + bill.balance}</td>
                                            <td className={`hidden md:table-cell p-3 text-center font-semibold ${bill.status === 'Paid'
                                                    ? 'text-green-600'
                                                    : bill.status === 'Partial'
                                                        ? 'text-yellow-500'
                                                        : 'text-red-600'
                                                }`}>
                                                {bill.status}
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="p-4 flex justify-end space-x-5 items-center text-sm text-gray-600">
                            <div>
                                Rows per page: {pageSize} | {(page - 1) * pageSize + 1} - {((page - 1) * pageSize + 1) + filteredBills.length - 1} of {filteredBills.data?.totalCount || 0}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page <= 1}
                                    className="px-3 py-1 border rounded disabled:opacity-30"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page * pageSize >= getMonthBills.data?.totalCount}
                                    className="px-3 py-1 border rounded disabled:opacity-30"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Display bills or anything you want here */}
        </div>
    );
}
