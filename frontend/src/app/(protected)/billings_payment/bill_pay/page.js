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
import { useDeletePayment } from '@/hooks/usePayment';
import useAuthStore from '@/store/useAuthStore';
import ToastModal from '@/components/modals/ToastModal';
import { useQueryClient } from '@tanstack/react-query';

export default function BillAndPayPage() {
    const { userId } = useAuthStore(state => state);
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
    const { getPayment } = usePaymentById(paymentId ?? 0, {
        enabled: !!paymentId,
    });
    const user = useUserById(userId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentType, setPaymentType] = useState('Cash');
    const [amountPaid, setAmountPaid] = useState();
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    const billRef = useRef(null);
    const paymentRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
        setPaymentToDelete(paymentId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeletePayment = () => {
        if (!paymentToDelete) return;
        
        deletePaymentMutation.mutate(paymentToDelete, {
            onSuccess: () => {
                setToastConfig({
                    type: 'success',
                    message: 'Payment deleted successfully!'
                });
                setIsToastOpen(true);
                setIsDeleteModalOpen(false);
                setPaymentToDelete(null);
                setTimeout(() => {
                    queryClient.invalidateQueries(['payments']);
                    window.location.reload();
                }, 1500);
            },
            onError: (error) => {
                setToastConfig({
                    type: 'error',
                    message: 'Error deleting payment. Please try again.'
                });
                setIsToastOpen(true);
                setIsDeleteModalOpen(false);
                setPaymentToDelete(null);
                console.error('Error deleting payment:', error);
            },
        });
    };

    const queryClient = useQueryClient();

    if (
        getConsumer.isLoading ||
        filterConsumerBills.isLoading ||
        getPayment.isLoading ||
        getRatesInfo.loading ||
        getReading.isLoading ||
        user.isLoading
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-700">Loading...</div>
            </div>
        );
    }

    if (
        getConsumer.error ||
        filterConsumerBills.isError ||
        getPayment.isError ||
        getRatesInfo.error ||
        getReading.error ||
        user.error
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg font-semibold text-red-600">Error loading data</div>
            </div>
        );
    }

    const consumer = getConsumer.data;
    const bill = firstBill;
    const payment = getPayment.data;
    const processedBy = user.data;
    const rates = getRatesInfo.data || { consumerCubicMeterRate: 0, penaltyRate: 0 };
    const reading = getReading.data;

    const penalty = new Date().getDate() > 20
        ? (rates?.penaltyRate || 0)
        : 0;

    const serviceFee = paymentType !== 'Cash' ? Math.ceil((bill?.totalAmount || 0) / 100) : 0;
    const totalAmountDue = ((bill?.totalAmount || 0) + serviceFee + penalty).toFixed(2);

    const handleCreatePayment = () => {
        const amountPaidNum = parseFloat(amountPaid);
        const totalAmountDueNum = parseFloat(totalAmountDue);

        if (amountPaidNum > totalAmountDueNum) {
            setToastConfig({
                type: 'error',
                message: 'Payment amount cannot exceed the total amount due.'
            });
            setIsToastOpen(true);
            return;
        }

        const payload = {
            billId: bill.billId,
            userId: processedBy.userId,
            amountPaid: amountPaidNum,
            paymentType,
        };
        createPaymentMutation.mutate(payload, {
            onSuccess: () => {
                setToastConfig({
                    type: 'success',
                    message: 'Payment processed successfully!'
                });
                setIsToastOpen(true);
                closeModal();
            },
            onError: (error) => {
                setToastConfig({
                    type: 'error',
                    message: 'Error processing payment. Please try again.'
                });
                setIsToastOpen(true);
                console.error(error);
            },
        });
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen lg:h-screen lg:overflow-hidden">
            {/* Page header */}
            <div className="flex flex-col p-3 bg-white shadow-md">
                <div className="flex items-center gap-2">
                    <Link href="/billings_payment" className="hover:text-blue-500 hover:underline text-lg font-bold">
                        Billings & Payment
                    </Link>
                    <h1 className="text-lg font-bold text-gray-700">/ {consumer.firstName} {consumer.lastName}</h1>
                </div>
                <div className="text-gray-500 font-semibold text-sm">
                    {formatDateMonthYear(bill.monthYear)}
                </div>
            </div>

            <div className="p-4 lg:h-[calc(100vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-full">
                    {/* BILLING RECEIPT */}
                    <div className="flex flex-col lg:h-full">
                        <div ref={billRef} className="printable bg-white p-4 rounded-lg shadow-lg font-mono text-sm flex flex-col lg:h-full">
                            <div className="text-center mb-2 font-bold text-base">BILLING</div>
                            <div className="text-center mb-2 font-bold">
                                <div className="border-2 border-dashed rounded-lg p-2">
                                    BRGY. LIBAS WATER SERVICES & DEVELOPMENT ASSOC. INC.
                                </div>
                            </div>
                            <div className="text-center text-xs font-semibold mb-2">
                                {formatDate(bill?.monthYear)}
                            </div>
                            
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-y-2 mb-2">
                                <div className="font-semibold">Customer Name:</div>
                                <div className="text-right">{consumer?.firstName} {consumer?.lastName}</div>
                                <div className="font-semibold">Purok:</div>
                                <div className="text-right">{consumer?.purok.replace('_', ' ')}</div>
                                <div className="font-semibold">Meter Number:</div>
                                <div className="text-right">{consumer?.meterNumber}</div>
                            </div>
                            
                            <hr className="my-2 border-gray-300" />
                            
                            {/* Readings */}
                            <div className="grid grid-cols-2 gap-y-2">
                                <div className="font-semibold">Previous Reading:</div>
                                <div className="text-right">{reading?.previousReading || 0} m³</div>
                                <div className="font-semibold">Present Reading:</div>
                                <div className="text-right">{reading?.presentReading || 0} m³</div>
                                <div className="font-semibold">Cubic Meter:</div>
                                <div className="text-right">{bill?.cubicUsed || 0} m³</div>
                                <div className="font-semibold">Cubic Meter Amount:</div>
                                <div className="text-right">₱{((bill?.cubicUsed || 0) * (rates?.consumerCubicMeterRate || 0)).toFixed(2)}</div>
                                <div className="font-semibold">System Loss:</div>
                                <div className="text-right">₱{bill?.systemLoss || 0}</div>
                                <div className="font-semibold">Balance:</div>
                                <div className="text-right">₱{bill?.balance || 0}</div>
                                <div className="font-semibold">Subsidy:</div>
                                <div className="text-right">₱{bill?.subsidy || 0}</div>
                            </div>
                            
                            <hr className="my-2 border-gray-300" />
                            
                            <div className="flex justify-between font-bold text-base mt-auto">
                                <span>TOTAL</span>
                                <span>₱{bill?.totalAmount || 0}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-2">
                                <span>REMARKS</span>
                                <span className={`${
                                    bill.status === 'Paid' ? 'text-green-600' :
                                    bill.status === 'Partial' ? 'text-yellow-500' :
                                    'text-red-600'
                                }`}>{bill.status}</span>
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                            <div className="text-xs text-gray-600">
                                Notified Via: {bill.notifStatus ?? "N/A"}
                            </div>
                            <button
                                onClick={handlePrintBill}
                                className="bg-[#fb8500] text-white px-4 py-1.5 rounded-lg hover:bg-[#e67e00] transition-colors duration-200 text-sm"
                            >
                                Print Bill
                            </button>
                        </div>
                    </div>

                    {/* PAYMENT RECEIPT */}
                    {bill.status === "Paid" || bill.status === "Partial" ? (
                        <div className="flex flex-col lg:h-full">
                            <div ref={paymentRef} className="printable bg-white p-4 rounded-lg shadow-lg font-mono text-sm flex flex-col lg:h-full">
                                <div className="text-center mb-2 font-bold text-base">PAYMENT</div>
                                <div className="text-center mb-2 font-bold">
                                    <div className="border-2 border-dashed rounded-lg p-2">
                                        BRGY. LIBAS WATER SERVICES & DEVELOPMENT ASSOC. INC.
                                    </div>
                                </div>
                                <div className="text-center text-xs font-semibold mb-2">
                                    {formatDate(payment?.paymentDate)}
                                </div>
                                
                                {/* Payment Info */}
                                <div className="grid grid-cols-2 gap-y-2 mb-2">
                                    <div className="font-semibold">Customer Name:</div>
                                    <div className="text-right">{consumer?.firstName} {consumer?.lastName}</div>
                                    <div className="font-semibold">Address:</div>
                                    <div className="text-right">{consumer?.purok.replace('_', ' ')}</div>
                                    <div className="font-semibold">Meter Number:</div>
                                    <div className="text-right">{consumer?.meterNumber}</div>
                                    <div className="font-semibold">Payment Method:</div>
                                    <div className="text-right">{payment?.paymentType}</div>
                                </div>
                                
                                <hr className="my-2 border-gray-300" />
                                
                                <div className="grid grid-cols-2 gap-y-2">
                                    <div className="font-semibold">Previous Reading:</div>
                                    <div className="text-right">{reading?.previousReading || 0} m³</div>
                                    <div className="font-semibold">Present Reading:</div>
                                    <div className="text-right">{reading?.presentReading || 0} m³</div>
                                    <div className="font-semibold">Cubic Meter:</div>
                                    <div className="text-right">{bill?.cubicUsed || 0} m³</div>
                                    <div className="font-semibold">Cubic Meter Amount:</div>
                                    <div className="text-right">₱{((bill?.cubicUsed || 0) * (rates?.consumerCubicMeterRate || 0)).toFixed(2)}</div>
                                    <div className="font-semibold">System Loss:</div>
                                    <div className="text-right">₱{bill?.systemLoss || 0}</div>
                                    <div className="font-semibold">Balance:</div>
                                    <div className="text-right">₱{bill?.balance || 0}</div>
                                    <div className="font-semibold">Penalty:</div>
                                    <div className="text-right">₱{penalty}</div>
                                    <div className="font-semibold">Payment Service Fee:</div>
                                    <div className="text-right">₱{serviceFee}</div>
                                    <div className="font-semibold">Subsidy:</div>
                                    <div className="text-right">₱{bill?.subsidy || 0}</div>
                                </div>
                                
                                <hr className="my-2 border-gray-300" />
                                
                                <div className="flex justify-between font-bold text-base mt-auto">
                                    <span>TOTAL</span>
                                    <span>₱{totalAmountDue}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Amount Paid</span>
                                    <span className="text-green-600">₱{payment?.amountPaid || 0}</span>
                                </div>
                                <div className="text-center text-xs mt-2">
                                    Processed by: <span className="underline">{processedBy?.name}</span>
                                </div>
                            </div>

                            <div className="mt-2 flex justify-between space-x-2">
                                <button
                                    onClick={() => handleDeletePayment(payment?.paymentId)}
                                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                                >
                                    Delete Payment
                                </button>
                                <button
                                    onClick={handlePrintPayment}
                                    className="bg-[#fb8500] text-white px-4 py-1.5 rounded-lg hover:bg-[#e67e00] transition-colors duration-200 text-sm"
                                >
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center">
                            <button
                                onClick={openModal}
                                className="bg-[#023047] text-white px-6 py-2 rounded-lg hover:bg-[#012235] transition-colors duration-200 text-base font-semibold"
                            >
                                Process Payment
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Pay Bill</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Payment Type</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="GCash">GCash</option>
                                    <option value="Maya">Maya</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="font-semibold text-gray-700">Total Amount Due</label>
                                    {penalty > 0 && (
                                        <span className="text-red-500 text-xs font-medium">
                                            Overdue, Penalty Added
                                        </span>
                                    )}
                                </div>
                                <div className="border rounded-lg px-3 py-2 bg-gray-50 font-semibold text-base">
                                    ₱ {totalAmountDue}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Amount Paid</label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const totalAmountDueNum = parseFloat(totalAmountDue);
                                        if (parseFloat(value) > totalAmountDueNum) {
                                            setToastConfig({
                                                type: 'error',
                                                message: 'Payment amount cannot exceed the total amount due.'
                                            });
                                            setIsToastOpen(true);
                                        }
                                        setAmountPaid(value);
                                    }}
                                    className="w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter amount"
                                    max={totalAmountDue}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePayment}
                                    className="bg-green-500 text-white px-4 py-1.5 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
                                >
                                    Submit Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-500/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Delete Payment</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete this payment? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setPaymentToDelete(null);
                                }}
                                className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletePayment}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                            >
                                Delete Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Modal */}
            <ToastModal
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                type={toastConfig.type}
                message={toastConfig.message}
            />
        </div>
    );
}