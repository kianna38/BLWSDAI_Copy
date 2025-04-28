'use client';

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSearchParams, useRouter } from 'next/navigation';
import { useConsumerById, useFilterConsumerBills } from '@/hooks/useConsumer';
import { usePaymentById, useCreatePayment } from '@/hooks/usePayment';
import { useUserById } from '@/hooks/useUser';
import { useReadingById } from '@/hooks/useReading';
import { useRatesInfo } from '@/hooks/useRatesInfo';
import Link from 'next/link';
import { formatDateMonthYear, formatDate } from '@/utils/formatDate';
import { useDeletePayment } from '@/hooks/usePayment'; // if you use a hooks folder
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state

export default function BillAndPayPage() {
    const { userId } = useAuthStore(state => state); // Getting userId and token from Zustand
    const router = useRouter();
    const searchParams = useSearchParams();
    const consumerId = searchParams.get('consumerId');
    const monthYear = searchParams.get('monthYear');

    const [filter, setFilter] = useState({
        consumerId: consumerId,
        monthYear: monthYear,
        page: 1,
        pageSize: 10
    });

    const { createPaymentMutation } = useCreatePayment();
    const { deletePaymentMutation } = useDeletePayment();
    const { filterConsumerBills } = useFilterConsumerBills(filter);
    const { getConsumer } = useConsumerById(consumerId);
    const { getRatesInfo } = useRatesInfo();

    const firstBill = filterConsumerBills?.data?.data?.[0];

    const { getReading } = useReadingById(firstBill?.readingId || 0);

    const paymentId = firstBill?.paymentId;

    // Then fetch payment ONLY if paymentId exists
    const { getPayment } = usePaymentById(paymentId ?? 0, {
        enabled: !!paymentId, // Fetch only if paymentId is valid
    });

    const user = useUserById(userId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentType, setPaymentType] = useState('Cash');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [amountPaid, setAmountPaid] = useState(); // default to totalAmount


    const billRef = useRef(null);
    const paymentRef = useRef(null);

    const pageStyle = `
      @page {
        size: auto;
        margin: 20mm;
      }
    `;


    const handlePrintBill = useReactToPrint({
        documentTitle: 'Bill',
        contentRef: billRef,
    });

    const handlePrintPayment = useReactToPrint({
        documentTitle: 'Bill',
        contentRef: paymentRef,
    });


    const handleDeletePayment = (paymentId) => {
        if (!paymentId) return;

        if (window.confirm('Are you sure you want to delete this payment?')) {
            deletePaymentMutation.mutate(paymentId, {
                onSuccess: () => {
                    alert('Payment deleted successfully!');
                    queryClient.invalidateQueries(['payments']);
                    window.location.reload(); // optional
                },
                onError: (error) => {
                    console.error('Error deleting payment:', error);
                },
            });
        }
    };


    // Handle loading or error after hooks
    if (
        getConsumer.isLoading ||
        filterConsumerBills.isLoading ||
        getPayment.isLoading ||
        getRatesInfo.loading ||
        getReading.isLoading ||
        user.isLoading
    ) {
        return <div>Loading...</div>;
    }

    if (
        getConsumer.error ||
        filterConsumerBills.isError ||
        getPayment.isError ||
        getRatesInfo.error ||
        getReading.error ||
        user.error
    ) {
        return <div>Error loading data</div>;
    }

    const consumer = getConsumer.data;
    const bill = firstBill;
    const payment = getPayment.data;
    const processedBy = user.data;
    const rates = getRatesInfo.data;
    const reading = getReading.data;


    console.log('payment');
    console.log(bill);
    console.log(payment);

    const penalty = new Date().getDate() > 20
        ? rates.penaltyRate
        : (0);


    const serviceFee = paymentType !== 'Cash' ? Math.ceil(bill.totalAmount / 100) : 0;
    const totalAmountDue = (bill.totalAmount + serviceFee + penalty).toFixed(2);


    console.log(totalAmountDue);

    const handleCreatePayment = () => {
        const payload = {
            billId: bill.billId,
            userId: processedBy.userId,
            amountPaid: parseFloat(amountPaid),
            paymentType,
        };
        createPaymentMutation.mutate(payload, {
            onSuccess: () => {
                alert('Payment created successfully!');
                closeModal();
            },
            onError: (error) => {
                alert('Error creating payment');
                console.error(error);
            },
        });
    };

    console.log(payment);


    return (
            <div className="bg-slate-100 text-black min-h-screen">
                {/* Page header */}
                <div className="flex flex-col p-2 bg-white shadow-inner justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Link href="/billings_payment" className="hover:text-blue-500 hover:underline text-xl font-bold">
                            Billings & Payment
                        </Link>
                        <h1 className="text-xl font-bold text-gray-700">/ {consumer.firstName} {consumer.lastName}</h1>
                    </div>
                    <div className="text-gray-500 font-semibold text-sm ">
                        {formatDateMonthYear(bill.monthYear)}
                    </div>
                </div>

                {/* Two receipts side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">

                    {/* BILLING RECEIPT */}
                    <div className="flex flex-col  justify-center">
                        <div ref={billRef} className="printable bg-white w-full p-6 rounded shadow-lg font-mono text-sm flex flex-col">
                            <div className="text-center mb-2 font-bold">BILLING</div>
                            <div className="text-center mb-2 font-bold">
                                <div className="border border-dashed rounded p-2">
                                    BRGY. LIBAS WATER SERVICES & DEVELOPMENT ASSOC. INC.
                                </div>
                            </div>
                            <div className="text-center text-xs font-semibold mb-2">
                                {formatDate(bill?.monthYear)}
                            </div>
                            {/* Billing content */}
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-y-2">
                                <div>Customer Name:</div><div className="text-right">{consumer?.firstName} {consumer?.lastName}</div>
                                <div>Purok:</div><div className="text-right">{consumer?.purok.replace('_', ' ')}</div>
                                <div>Meter Number:</div><div className="text-right">{consumer?.meterNumber}</div>
                            </div>
                            <hr className="my-2" />
                            {/* Readings */}
                            <div className="grid grid-cols-2 gap-y-1">
                                <div>Previous Reading:</div><div className="text-right">{reading?.previousReading} m³</div>
                                <div>Present Reading:</div><div className="text-right">{reading?.presentReading} m³</div>
                                <div>Cubic Meter:</div><div className="text-right">{bill?.cubicUsed} m³</div>
                                <div className="mt-2">Cubic Meter Amount:</div><div className="text-right mt-2">₱{bill?.cubicUsed * rates.consumerCubicMeterRate}</div>
                                <div>System Loss:</div><div className="text-right">₱{bill?.systemLoss}</div>
                                <div>Balance:</div><div className="text-right">₱{bill?.balance}</div>
                                <div className="mt-2">Subsidy:</div><div className="text-right mt-2">₱{bill?.subsidy}</div>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-bold">
                                <span>TOTAL</span><span>₱{bill?.totalAmount}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-4">
                            <span>REMARKS</span><span className="text-blue-600">{ bill.status}</span>
                            </div>
                        </div>

                        <div className="flex mt-6 justify-between items-center">
                            <div>Notified Via: {bill.notifStatus ?? "N/A"}</div>
                            <button
                            onClick={() => {
                                console.log(billRef.current);
                                handlePrintBill();}}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Print Bill
                            </button>
                        </div>
                    </div>

                {/* PAYMENT RECEIPT */}
                {bill.status == "Paid" || bill.status == "Partial" ? (
                    <div>
                        <div ref={paymentRef} className="printable bg-white w-full p-6 rounded shadow-lg font-mono text-sm flex flex-col">
                            <div className="text-center mb-2 font-bold">PAYMENT</div>
                            <div className="text-center mb-2 font-bold">
                                <div className="border border-dashed rounded p-2">
                                    BRGY. LIBAS WATER SERVICES & DEVELOPMENT ASSOC. INC.
                                </div>
                            </div>
                            <div className="text-center text-xs font-semibold mb-2">
                                {formatDate(payment?.paymentDate)}
                            </div>
                            {/* Payment content */}
                            <div className="grid grid-cols-2 gap-y-2">
                                <div>Customer Name:</div><div className="text-right">{consumer?.firstName} {consumer?.lastName}</div>
                                <div>Address:</div><div className="text-right">{consumer?.purok.replace('_', ' ')}</div>
                                <div>Meter Number:</div><div className="text-right">{consumer?.meterNumber}</div>
                                <div>Payment Method:</div><div className="text-right">{payment?.paymentType}</div>
                            </div>
                            <hr className="my-2" />
                            <div className="grid grid-cols-2 gap-y-1">
                                <div>Previous Reading:</div><div className="text-right">{reading?.previousReading} m³</div>
                                <div>Present Reading:</div><div className="text-right">{reading?.presentReading} m³</div>
                                <div>Cubic Meter:</div><div className="text-right">{bill?.cubicUsed} m³</div>
                                <div className="mt-2">Cubic Meter Amount:</div><div className="text-right mt-2">₱{bill?.cubicUsed * rates.consumerCubicMeterRate}</div>
                                <div>System Loss:</div><div className="text-right">₱{bill?.systemLoss}</div>
                                <div>Balance:</div><div className="text-right">₱{bill?.balance}</div>
                                <div>Penalty:</div><div className="text-right">₱{penalty}</div>
                                <div>Payment Service Fee:</div><div className="text-right">₱{serviceFee}</div>
                                <div className="mt-2">Subsidy:</div><div className="text-right mt-2">₱{bill?.subsidy}</div>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-bold">
                                <span>TOTAL</span><span>₱{totalAmountDue}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-4">
                                <span>Amount Paid</span><span className="text-green-600">₱{payment?.amountPaid}</span>
                            </div>
                            <div className="text-center text-xs mt-6">
                                Processed by: <span className="underline">{processedBy?.name}</span>
                            </div>
                        </div>

                        <div className="flex justify-between my-6 space-x-2">
                            <button
                                onClick={() => handleDeletePayment(payment?.paymentId)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Delete Payment
                            </button>
                            <button
                                onClick={() => handlePrintPayment()}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Print Receipt
                            </button>
                        </div>
                    </div> )
                    : (
                    <div className="flex justify-center items-center  ">
                      <button
                        onClick={openModal}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 max-h-20"
                      >
                        Process Payment
                      </button>
                    </div>
                    )}

            </div>
            {/* PAYMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Pay Bill</h2>

                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">Payment Type</label>
                            <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="Cash">Cash</option>
                                <option value="GCash">GCash</option>
                                <option value="Maya">Maya</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center">
                                <label className="block mb-1 font-semibold">Total Amount Due</label>
                                <div className="pl-2 mb-1  text-red-500 text-sm">
                                    {penalty > 0 ?
                                        "Overdue, Penalty Added"
                                    :
                                        ""
                                    }
                                </div>
                            </div>
                            <div className="border rounded px-3 py-2 bg-gray-100">
                                ₱ {totalAmountDue}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">Amount Paid</label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={closeModal}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePayment}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Submit Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
    );
}