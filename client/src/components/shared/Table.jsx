import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * A reusable, flexible Table component for displaying tabular data.
 * Supports sorting, custom rendering, and robust data access.
 * * @param {Array} data - The array of objects to display.
 * @param {Array} columns - The configuration array for table columns.
 */
const Table = ({ data, columns }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    
    // --- Data Extraction Helper ---
    // Safely retrieves a nested value from an object using a dot-separated path (e.g., 'user.name')
    const getDeepValue = (obj, path) => {
        if (!obj || !path) return null;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        } catch (e) {
            console.error(`Error accessing deep value for path: ${path}`, e);
            return null;
        }
    };
    
    // --- Sorting Logic ---
    const sortedData = React.useMemo(() => {
        // Defensive copy and null check
        let sortableItems = Array.isArray(data) ? [...data] : []; 
        
        if (sortConfig.key !== null) {
            const key = sortConfig.key;
            const direction = sortConfig.direction;

            sortableItems.sort((a, b) => {
                const aValue = getDeepValue(a, key);
                const bValue = getDeepValue(b, key);

                // Handle null/undefined values gracefully during comparison
                if (aValue == null) return direction === 'ascending' ? 1 : -1;
                if (bValue == null) return direction === 'ascending' ? -1 : 1;
                
                // Perform case-insensitive string comparison
                const valA = (typeof aValue === 'string') ? aValue.toLowerCase() : aValue;
                const valB = (typeof bValue === 'string') ? bValue.toLowerCase() : bValue;

                if (valA < valB) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUp className="w-4 h-4 ml-1 text-blue-500" />;
        }
        return <ChevronDown className="w-4 h-4 ml-1 text-blue-500" />;
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg">
                No records found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th 
                                key={index} 
                                onClick={column.accessor ? () => requestSort(column.accessor) : undefined}
                                className={`
                                    px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
                                    ${column.accessor ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none' : ''}
                                `}
                            >
                                <div className="flex items-center">
                                    {column.header}
                                    {column.accessor && getSortIcon(column.accessor)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {sortedData.map((item, rowIndex) => (
                        // Ensure we have a valid key, using _id as primary identifier
                        <tr key={item._id || rowIndex} className="hover:bg-gray-50 transition-colors">
                            {columns.map((column, colIndex) => {
                                // 1. Get the raw value based on accessor
                                const rawValue = column.accessor ? getDeepValue(item, column.accessor) : null;
                                
                                // 2. Determine the cell content using custom render logic
                                let content;
                                if (column.render) {
                                    // CRITICAL FIX: If no accessor, we pass the entire item object, 
                                    // matching the expected signature of the Actions column render function.
                                    content = column.accessor 
                                        ? column.render(rawValue, item) 
                                        : column.render(item); // Correct signature for Actions column
                                } else {
                                    // Default content display
                                    content = rawValue ?? '';
                                }

                                return (
                                    <td 
                                        key={colIndex} 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                    >
                                        {content}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;