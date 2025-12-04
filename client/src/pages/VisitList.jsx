import React, { useMemo } from "react";

/**
 * Renders the list of scheduled visits and cross-references them with actual follow-ups.
 * @param {Date[]} visitSchedule - Array of scheduled Date objects/strings.
 * @param {Object} followUpsByDate - Map of the LATEST actual follow-up object keyed by ISO date string (YYYY-MM-DD).
 * @param {function} onMarkComplete - Handler (dateIso: string) => void.
 * @param {function} onMarkMissed - Handler (dateIso: string) => void.
 * @param {function} onEditVisit - Handler (dateIso: string) => void.
 */
const VisitList = ({
  visitSchedule,
  followUpsByDate,
  onMarkComplete,
  onMarkMissed,
  onEditVisit,
}) => {
  const scheduledVisits = useMemo(() => {
    const uniqueDates = [...new Set(visitSchedule.map(d => new Date(d).toISOString().split("T")[0]))];

    return uniqueDates.map(dateStr => {
      const followUp = followUpsByDate[dateStr] || null;
      let status = 'Scheduled';

      if (followUp) {
        const storedStatus = followUp.status;
        // Capitalize the status
        status = storedStatus ? storedStatus.charAt(0).toUpperCase() + storedStatus.slice(1) : 'Completed';

        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('missed')) {
          status = 'Missed';
        } else if (lowerStatus.includes('completed')) {
          status = 'Completed';
        }
      } else {
        const date = new Date(dateStr);
        const today = new Date().toISOString().split("T")[0];

        if (date < new Date() && dateStr !== today) {
          status = 'Overdue/Missed';
        }
      }

      return {
        dateIso: dateStr,
        displayDate: new Date(dateStr).toLocaleDateString(),
        status,
        followUp, 
      };
    }).sort((a, b) => new Date(a.dateIso) - new Date(b.dateIso));
  }, [visitSchedule, followUpsByDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Missed':
      case 'Overdue/Missed':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-gray-700">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Weight (kg)</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scheduledVisits.map((visit) => (
            <tr key={visit.dateIso} className="border-b hover:bg-gray-50">
              {/* Enhance Date Visibility */}
              <td className="p-2 font-semibold text-gray-800">{visit.displayDate}</td>
              <td className="p-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(visit.status)}`}>
                  {visit.status}
                </span>
              </td>
              {/* Darker Weight display */}
              <td className="p-2 font-semibold text-gray-800">{visit.followUp?.weightKg || 'N/A'}</td>
              <td className="p-2 text-gray-600 max-w-xs truncate">{visit.followUp?.notes || 'N/A'}</td>
              <td className="p-2 space-x-2 text-center whitespace-nowrap">
                {visit.status === 'Completed' || visit.status === 'Missed' || visit.status === 'Overdue/Missed' ? (
                  <button
                    onClick={() => onEditVisit(visit.dateIso)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                  >
                    {visit.status === 'Completed' ? 'Edit Data' : 'View/Edit Note'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onMarkComplete(visit.dateIso)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => onMarkMissed(visit.dateIso)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Mark Missed
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitList;