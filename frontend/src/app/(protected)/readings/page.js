'use client';
import { useState, useEffect, useMemo } from 'react';
import { useMotherMeterReadings, useSystemLoss, useCreateUpdateMotherMeterReading } from '@/hooks/useMotherMeter'; // Get all mother meter readings
import { useReadingsByMonthYear, useReadingSummary, useCreateReading, useUpdateReading } from '@/hooks/useReading'; // Get readings by month-year
import { useFilterConsumers } from '@/hooks/useConsumer'; // Filter consumers
import { useGenerateBills } from '@/hooks/useBill'; // Filter consumers
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';  // Fetch search params (consumerId)
import { Combobox } from '@headlessui/react';
import ToastModal from '@/components/modals/ToastModal';

export default function ReadingsPage() {
    const today = new Date();
    const initialMonthYear = `${today.getFullYear()} ${today.toLocaleString('default', { month: 'long' })}`;

    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);    
    const [page, setPage] = useState(1); // State to track the current page
    const [pageSize, setPageSize] = useState(20); // State to track the page size (records per page)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
    const [selectedConsumerId, setSelectedConsumerId] = useState('');
    const [inputPresentReading, setInputPresentReading] = useState('');
    const [consumerSearch, setConsumerSearch] = useState('');
    const [motherMeterPresentReading, setMotherMeterPresentReading] = useState('');
    const [isMotherMeterOpen, setIsMotherMeterOpen] = useState(false);
    const [isEditReadingOpen, setIsEditReadingOpen] = useState(false);
    const [editingReadingId, setEditingReadingId] = useState(null);
    const [editingPresentReading, setEditingPresentReading] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });

    const { generateBillsMutation } = useGenerateBills();
    const { createUpdateReadingMutation } = useCreateUpdateMotherMeterReading();
    const { updateReadingMutation } = useUpdateReading();
    const { createReadingMutation } = useCreateReading();
    const { readingsQuery } = useMotherMeterReadings(); // Fetch all mother meter readings
    const { systemLossQuery } = useSystemLoss(selectedMonthYear); // Fetch all mother meter readings
    const { readingSummaryQuery } = useReadingSummary(selectedMonthYear);
    const { getFilteredReading } = useReadingsByMonthYear(selectedMonthYear, page, pageSize);
    const { data: consumerData, isLoading: consumerLoading } = useFilterConsumers({ statuses: ['Active'], pageSize: 500 });
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

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
    const filteredReadings = useMemo(() => {
        if (!getFilteredReading?.data?.data || filteredConsumers.length === 0) return [];
        return getFilteredReading.data.data.filter(reading =>
            filteredConsumers.some(consumer => consumer.consumerId === reading.consumerId)
        );
    }, [getFilteredReading?.data?.data, filteredConsumers]);

    // Sorting
    const sortedReadings = useMemo(() => {
        if (!filteredReadings) return [];

        const sorted = [...filteredReadings];

        sorted.sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'purok':
                    aValue = consumerData?.data.find(c => c.consumerId === a.consumerId)?.purok || '';
                    bValue = consumerData?.data.find(c => c.consumerId === b.consumerId)?.purok || '';
                    break;
                case 'name':
                    aValue = consumerData?.data.find(c => c.consumerId === a.consumerId)?.lastName || '';
                    bValue = consumerData?.data.find(c => c.consumerId === b.consumerId)?.lastName || '';
                    break;
                case 'presentReading':
                    aValue = a.presentReading;
                    bValue = b.presentReading;
                    break;
                case 'previousReading':
                    aValue = a.previousReading;
                    bValue = b.previousReading;
                    break;
                case 'm3Used':
                    aValue = a.presentReading - a.previousReading;
                    bValue = b.presentReading - b.previousReading;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredReadings, sortConfig, consumerData]);




    // Filter the consumer data without reading
    const consumersWithoutReading = useMemo(() => {
        if (!consumerData?.data || !getFilteredReading.data?.data) return [];

        const consumersWithReadingsIds = getFilteredReading.data?.data.map(reading => reading.consumerId);

        return consumerData.data.filter(consumer => !consumersWithReadingsIds.includes(consumer.consumerId));
    }, [consumerData, getFilteredReading.data?.data]);


    // Loading and Error States
    if (readingsQuery.isLoading || consumerLoading || readingSummaryQuery.isLoading || getFilteredReading.isLoading ) return <div>Loading...</div>;
    if (readingsQuery.isError || readingSummaryQuery.isError) return <div>Error loading data</div>;



    // Extract available months from the fetched readings
    const availableMonths = readingsQuery?.data
        ?.filter((reading) => {
            const monthYear = new Date(reading.monthYear);
            const now = new Date();

            // Only include months that are before or the same as today
            return (
                monthYear.getFullYear() < now.getFullYear() ||
                (monthYear.getFullYear() === now.getFullYear() && monthYear.getMonth() <= now.getMonth())
            );
        })
        .map((reading) => {
            const monthYear = new Date(reading.monthYear);
            const year = monthYear.getFullYear();
            const month = monthYear.toLocaleString('default', { month: 'long' }); // Full month name
            return `${year} ${month}`;
        }) || [];

    // Remove duplicates
    const uniqueAvailableMonths = [...new Set(availableMonths)];


    // Extract necessary data from queries
    const { totalConsumerReading, billGenerated, numOfActiveConsumers, numOfReadings, sumOfPresentReading, sumOfPreviousReading } = readingSummaryQuery.data;
    const readings = getFilteredReading.data?.data || [];
    const baseSystemLoss = systemLossQuery.data || [];
    const motherMeterReading = readingsQuery?.data?.find((reading) => {
        const date = new Date(reading.monthYear);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' }); // or 'short' if your select uses short month names
        const formattedMonthYear = `${year} ${month}`;
        return formattedMonthYear === selectedMonthYear;
    });



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


    const handleSubmitCreateReading = () => {
        if (!selectedConsumerId || !inputPresentReading) {
            setToastConfig({
                type: 'error',
                message: 'Please select a consumer and enter present reading.'
            });
            setIsToastOpen(true);
            return;
        }

        // ✨ Convert "2025 April" => Date object properly
        const parts = selectedMonthYear.split(' '); // ["2025", "April"]
        const year = parseInt(parts[0], 10);
        const monthName = parts[1];

        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
        const monthYearDate = new Date(Date.UTC(year, monthIndex, 1));

        const readingDetails = {
            consumerId: parseInt(selectedConsumerId),
            presentReading: parseFloat(inputPresentReading),
            monthYear: monthYearDate.toISOString(),
        };

        createReadingMutation.mutate(readingDetails, {
            onSuccess: (data) => {
                console.log('Success data:', data);
                if (data) {
                    setToastConfig({
                        type: 'success',
                        message: 'Reading created successfully!'
                    });
                    setIsToastOpen(true);
                    setIsAddReadingOpen(false);
                    setSelectedConsumerId('');
                    setInputPresentReading('');
                } else {
                    setToastConfig({
                        type: 'error',
                        message: 'Something went wrong even though server replied.'
                    });
                    setIsToastOpen(true);
                }
            },
            onError: (error) => {
                console.error('Mutation Error:', error);
                setToastConfig({
                    type: 'error',
                    message: 'Error creating reading'
                });
                setIsToastOpen(true);
            },
        });
    };

    const handleSubmitUpdateReading = () => {
        if (!editingReadingId || !editingPresentReading) {
            setToastConfig({
                type: 'error',
                message: 'Missing data for update.'
            });
            setIsToastOpen(true);
            return;
        }

        const updatedData = {
            presentReading: parseFloat(editingPresentReading)
        };

        updateReadingMutation.mutate(
            { readingId: editingReadingId, updatedReadingData: updatedData },
            {
                onSuccess: () => {
                    setToastConfig({
                        type: 'success',
                        message: 'Reading updated successfully!'
                    });
                    setIsToastOpen(true);
                    setIsEditReadingOpen(false);
                    setEditingReadingId(null);
                    setEditingPresentReading('');
                },
                onError: (error) => {
                    console.error('Error updating reading:', error);
                    setToastConfig({
                        type: 'error',
                        message: 'Error updating reading.'
                    });
                    setIsToastOpen(true);
                }
            }
        );
    };


    const handleSubmitMotherMeterReading = () => {
        if (!motherMeterPresentReading) {
            setToastConfig({
                type: 'error',
                message: 'Please enter a present reading.'
            });
            setIsToastOpen(true);
            return;
        }

        // Parse selectedMonthYear into ISO date
        const parts = selectedMonthYear.split(' '); // ["2025", "April"]
        const year = parseInt(parts[0], 10);
        const monthName = parts[1];
        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
        const monthYearDate = new Date(Date.UTC(year, monthIndex, 1));

        const payload = {
            presentReading: parseFloat(motherMeterPresentReading),
            monthYear: monthYearDate.toISOString(),
        };

        console.log('Mother meter payload:', payload);

        createUpdateReadingMutation.mutate(payload, {
            onSuccess: (data) => {
                console.log('Mother Meter Success:', data);
                setToastConfig({
                    type: 'success',
                    message: 'Mother meter reading created/updated!'
                });
                setIsToastOpen(true);
                setIsMotherMeterOpen(false);
                setMotherMeterPresentReading('');
            },
            onError: (error) => {
                console.error('Mother Meter Error:', error);
                setToastConfig({
                    type: 'error',
                    message: 'Error updating mother meter reading.'
                });
                setIsToastOpen(true);
            },
        });
    };

    const handleClickGenerateBill = () => {
        if (motherMeterReading.presentReading < totalConsumerReading) {
            setToastConfig({
                type: 'error',
                message: 'Mother Meter Reading cannot be lower than Total Consumer Readings!'
            });
            setIsToastOpen(true);
            return;
        }

        const parts = selectedMonthYear.split(' ');
        const year = parseInt(parts[0], 10);
        const monthName = parts[1];
        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
        const monthYearDate = new Date(Date.UTC(year, monthIndex, 1));
        const payload = monthYearDate.toISOString();

        console.log('Generating bills for payload:', payload);

        setIsGenerating(true);  // Set our manual loading

        generateBillsMutation.mutate(payload, {
            onSuccess: (data) => {
                setIsGenerating(false);   // Hide modal manually after success
                setToastConfig({
                    type: 'success',
                    message: 'Bills successfully generated!'
                });
                setIsToastOpen(true);
            },
            onError: (error) => {
                setIsGenerating(false);   // Hide modal manually after error
                console.error('Bills Generation:', error);
                setToastConfig({
                    type: 'error',
                    message: 'Error generating Bills.'
                });
                setIsToastOpen(true);
            },
        });
    };



    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            if (prevConfig.key === key) {
                // If already sorted by this key, toggle direction
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            } else {
                // Else, sort by new key ascending
                return { key, direction: 'asc' };
            }
        });
    };


    console.log(consumerData);


    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Header Section */}
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Readings</h1>
            </div>

            <div className="flex flex-col md:flex-row md:space-y-0 space-y-5 m-5 items-center justify-between mb-5">
                
                <div> 
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
            </div>
   
            <div className="flex flex-col sm:flex-row gap-10 mb-0 pt-0 pb-10 px-8">
               
                <div className="flex flex-col items-center bg-white py-6 w-2/3 px-1 md:w-1/3 rounded-lg shadow space-y-1">
                    <div className="flex">
                        <p className="text-sm text-center text-gray-500 mb-2">Mother Meter Reading</p>
                        {billGenerated ?
                            <div> </div>
                        :
                            <button onClick={() => setIsMotherMeterOpen(true)}>
                                <PencilIcon className="w-4 h-5 text-[#fb8500]" />
                            </button>
                        }

                    </div>
                    <hr className="w-full border-t border-gray-300 my-2" />

                    <div className="text-xl font-bold text-[#023047]">
                        {motherMeterReading?.reading || 'N/A'} m³
                    </div>
                    <div className="text-sm text-cyan-500">{motherMeterReading.presentReading} m³ - {motherMeterReading.previousReading} m³</div>

                </div>
                <div className="flex flex-col items-center bg-white py-6 w-2/3 md:w-1/3 rounded-lg shadow space-y-1">
                    <p className="text-sm text-center text-gray-500 mb-2">Total Consumer Readings</p>
                    <hr className="w-full border-t border-gray-300 my-2" />
                    <div className="text-xl font-bold text-[#023047]">{totalConsumerReading} m³</div>
                        <div className="text-sm text-cyan-500">{sumOfPresentReading} m³ - {sumOfPreviousReading} m³</div>
                </div>
                {/* Generate Bills Button */}
                {billGenerated ? 
                    <div className="flex flex-col items-center bg-white py-6 w-2/3 md:w-1/3 rounded-lg shadow space-y-1">
                        <p className="text-sm text-center text-gray-500 mb-2">Base System Loss</p>
                        <hr className="w-full border-t border-gray-300 my-2" />
                        <div className="text-xl font-bold text-[#023047]">₱{baseSystemLoss.baseSystemLoss}</div>
                        <div className="text-sm text-cyan-500">(( {baseSystemLoss.motherUsed} m³ - {baseSystemLoss.consumerUsed} m³) * {baseSystemLoss.motherRate} m³ ) / {baseSystemLoss.consumerUsed} m³</div>
                    </div>
                    :
                    <div className="flex justify-between items-center  px-4">
                        <button
                            onClick={() => handleClickGenerateBill()}
                            className={`py-2 px-4 rounded-md text-white ${billGenerated ? 'bg-gray-400' : 'bg-[#023047]'} disabled:cursor-not-allowed`}
                            disabled={numOfReadings != numOfActiveConsumers || generateBillsMutation.isLoading}
                        >
                            {generateBillsMutation.isLoading ? 'Generating...' : `Generate Bills (${numOfReadings}/${numOfActiveConsumers})`}
                        </button>
                    </div>                      
                }
            </div>

            

            {/* Consumer Readings Table */}
            <div className="flex flex-col pt-4 px-4 md:px-8 pb-10 space-y-5 border border-gray-300 rounded-md bg-white shadow-sm mx-4 md:mx-8">
                <div className="flex flex-col justify-between items-center mt-0 mb-4 md:flex-row pt-">
                    {/* Add Reading Button */}
                    {billGenerated ?
                        <div></div>
                    :
                        <div className=" ml-0 md:ml-4 mb-5 md:mb-0">
                            <button
                                className="justify-center  bg-[#fb8500] text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                onClick={() => setIsAddReadingOpen(true)}
                            >
                                <PlusIcon className="w-4 h-5 text-white" /> Add Reading
                            </button>
                        </div>
                    }
                    <div className="flex justify-end space-x-5 items-center mb-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-[#023047]" />
                            <input
                                type="text"
                                placeholder="Search Purok or Name"
                                className="pl-8 bg-[#e5e5e5] p-2 rounded shadow"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">

                    <table className="w-full text-sm text-left text-slate-700">


                        <thead className="bg-[#e5e5e5] text-gray-500 font-medium">
                            <tr className="text-center">

                                {/* Purok */}
                                <th
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort('purok')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Purok
                                        {sortConfig.key === 'purok' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                {/* Name */}
                                <th
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Name
                                        {sortConfig.key === 'name' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                {/* Present */}
                                <th
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort('presentReading')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Present
                                        {sortConfig.key === 'presentReading' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                {/* Previous */}
                                <th
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort('previousReading')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Previous
                                        {sortConfig.key === 'previousReading' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                {/* M³ Used */}
                                <th
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort('m3Used')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        M³ Used
                                        {sortConfig.key === 'm3Used' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-500" />
                                            )
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </th>

                                {/* Actions (no sort) */}
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>



                    <tbody>
                            {sortedReadings.map((reading, index) => {
                            // Find the consumer based on the consumerId in the readings data
                            const consumer = consumerData.data.find(consumer => consumer.consumerId === reading.consumerId);

                            return (
                                <tr
                                    key={index}
                                    onClick={billGenerated ? () => handleRowClick(consumer.consumerId, reading.monthYear) : undefined}
                                    className={`border-t border-b border-[#e5e5e5] hover:bg-cyan-200 text-center ${billGenerated ? "hover:bg-cyan-200 cursor-pointer" : "opacity-50"
                                        }`}
                                >

                                    {/* Purok and Name (consumerId should match to get the consumer's full name and purok) */}
                                    <td className="px-4 py-2">{consumer.purok.replace('_', ' ')}</td>
                                    <td className="px-4 py-2">
                                        {consumer ? `${consumer.lastName}, ${consumer.firstName}` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-2">{reading.presentReading} m³</td>
                                    <td className="px-4 py-2">{reading.previousReading} m³</td>
                                    <td className="px-4 py-2">{reading.presentReading - reading.previousReading} m³</td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            disabled={billGenerated}
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent row click
                                                setEditingReadingId(reading.readingId);
                                                setEditingPresentReading(reading.presentReading);
                                                setIsEditReadingOpen(true);
                                            }}
                                            title="Edit reading"
                                            className={billGenerated ? "text-gray-500" : "text-blue-500 hover:underline"}
                                        >
                                            {billGenerated ? "x" : "Edit"}
                                        </button>

                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>
                </table>
                    {/* Pagination Controls */}
                    <div className="p-4 flex justify-end space-x-5 items-center text-sm text-gray-600">
                        <div>
                            Rows per page: {pageSize} | {(page - 1) * pageSize + 1} - {((page - 1) * pageSize + 1) + filteredReadings.length -1 } of {getFilteredReading.data?.totalCount || 0}
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
                                disabled={page * pageSize >= getFilteredReading.data?.totalCount}
                                className="px-3 py-1 border rounded disabled:opacity-30"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
            </div>
            </div>

            {isAddReadingOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Add New Reading</h2>
                        {/* Search Input */}
                        <Combobox value={selectedConsumerId} onChange={(value) => setSelectedConsumerId(value)}>
                            <div className="relative">
                                <Combobox.Input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="Search consumer..."
                                    onChange={(e) => setConsumerSearch(e.target.value)}
                                    displayValue={(consumerId) => {
                                        const consumer = consumersWithoutReading.find(c => c.consumerId === consumerId);
                                        return consumer ? `${consumer.lastName}, ${consumer.firstName}` : '';
                                    }}
                                />

                                <Combobox.Options className="absolute mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto z-50">
                                    {consumersWithoutReading
                                        .filter(consumer => {
                                            const fullName = `${consumer.firstName} ${consumer.lastName}`.toLowerCase();
                                            const purok = consumer.purok?.toLowerCase() || '';
                                            return fullName.includes(consumerSearch.toLowerCase()) || purok.includes(consumerSearch.toLowerCase());
                                        })
                                        .map((consumer) => (
                                            <Combobox.Option
                                                key={consumer.consumerId}
                                                value={consumer.consumerId}
                                                className="px-4 py-2 hover:bg-cyan-100 cursor-pointer"
                                            >
                                                {consumer.lastName}, {consumer.firstName} - Purok {consumer.purok.replace('_', ' ')}
                                            </Combobox.Option>
                                        ))}
                                </Combobox.Options>
                            </div>
                        </Combobox>

                        {/* Present Reading input */}
                        <input
                            type="number"
                            value={inputPresentReading}
                            onChange={(e) => setInputPresentReading(e.target.value)}
                            placeholder="Enter Present Reading (m³)"
                            className="w-full mb-4 border rounded px-3 py-2"
                        />

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => setIsAddReadingOpen(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmitCreateReading()}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isMotherMeterOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Mother Meter Reading</h2>

                        {/* Present Reading Input */}
                        <input
                            type="number"
                            value={motherMeterPresentReading}
                            onChange={(e) => setMotherMeterPresentReading(e.target.value)}
                            placeholder="Enter Present Reading (m³)"
                            className="w-full mb-4 border rounded px-3 py-2"
                        />

                        {/* Show selected Month-Year */}
                        <div className="text-center text-sm text-gray-500 mb-6">
                            For Month-Year: {selectedMonthYear}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsMotherMeterOpen(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmitMotherMeterReading()}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditReadingOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Edit Present Reading</h2>

                        <input
                            type="number"
                            value={editingPresentReading}
                            onChange={(e) => setEditingPresentReading(e.target.value)}
                            placeholder="Enter new Present Reading (m³)"
                            className="w-full mb-4 border rounded px-3 py-2"
                        />

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsEditReadingOpen(false);
                                    setEditingReadingId(null);
                                    setEditingPresentReading('');
                                }}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitUpdateReading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isGenerating && (
                <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <p className="text-center text-lg font-semibold">Generating Bills, Please Wait...</p>
                    </div>
                </div>
            )}

            <ToastModal
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                type={toastConfig.type}
                message={toastConfig.message}
            />
        </div>
    );
}
