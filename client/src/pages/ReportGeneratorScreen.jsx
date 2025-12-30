import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap'; 
import { useDispatch, useSelector } from 'react-redux';
import { downloadPublicHealthReport, clearReportMessages } from '../redux/slices/reportSlice';
import { handleFileDownload } from '../utils/downloadUtility';
import LoadingSpinner from "../components/shared/LoadingSpinner"; 

const ReportGeneratorScreen = () => {
    const dispatch = useDispatch();
    const { downloading, downloadError } = useSelector((state) => state.reports);
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [successMessage, setSuccessMessage] = useState(null);

    
    useEffect(() => {
        // Clear messages on unmount
        return () => {
            dispatch(clearReportMessages());
        };
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        dispatch(clearReportMessages());

        if (!startDate || !endDate) {
            return; 
        }
        
        const resultAction = await dispatch(downloadPublicHealthReport({ startDate, endDate }));

        if (downloadPublicHealthReport.fulfilled.match(resultAction)) {
            const pdfBuffer = resultAction.payload; 
            const defaultFilename = `NTP_Report_${startDate}_to_${endDate}.pdf`;
            
            if (pdfBuffer && pdfBuffer.byteLength > 0) {
                 handleFileDownload(pdfBuffer, defaultFilename);
                 setSuccessMessage('Report successfully generated. Your download should start shortly.');
            } else {
                 setSuccessMessage(null);
            }

        } else if (downloadPublicHealthReport.rejected.match(resultAction)) {
            setSuccessMessage(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            
            {/* Added Back Button for standard navigation */}
            <div className="mb-4">
                <Link 
                    to="/reports" 
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition duration-150"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Reports Hub
                </Link>
            </div>
            
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Strategic Public Health Report Generator</h1>
                <p className="text-gray-700 mt-1">Generate the comprehensive Quarterly National TB Program (NTP) Surveillance Report in PDF format.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <Form onSubmit={submitHandler}>
                    {(downloading || downloadError || successMessage) && (
                        <div className="mb-4">
                            {downloading && <LoadingSpinner message="Preparing Report..." />}
                            {downloadError && <Alert variant='danger'>{downloadError}</Alert>}
                            {successMessage && <Alert variant='success'>{successMessage}</Alert>}
                        </div>
                    )}

                    {/* Form Layout */}
                    <div className="flex flex-wrap items-end -mx-3">
                        
                        {/* Start Date */}
                        <div className="w-full md:w-5/12 px-3 mb-4 md:mb-0">
                            <Form.Group controlId='startDate'>
                                <Form.Label className="font-semibold text-gray-800">Report Start Date</Form.Label>
                                <Form.Control
                                    type='date'
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    disabled={downloading}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                />
                            </Form.Group>
                        </div>

                        {/* End Date */}
                        <div className="w-full md:w-5/12 px-3 mb-4 md:mb-0">
                            <Form.Group controlId='endDate'>
                                <Form.Label className="font-semibold text-gray-800">Report End Date</Form.Label>
                                <Form.Control
                                    type='date'
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    disabled={downloading}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                />
                            </Form.Group>
                        </div>

                        {/* Button */}
                        <div className="w-full md:w-2/12 px-3">
                            <button 
                                type='submit' 
                                className={`w-full py-2.5 px-4 rounded-lg shadow-md text-sm font-bold text-white transition duration-150 ${
                                    downloading || !startDate || !endDate 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                                disabled={downloading || !startDate || !endDate}
                            >
                                {downloading ? 'Generating...' : 'Download PDF'}
                            </button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ReportGeneratorScreen;