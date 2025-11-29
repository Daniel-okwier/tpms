import React, { useMemo } from "react";

/**
 * Renders the list of scheduled visits and cross-references them with actual follow-ups.
 * @param {Date[]} visitSchedule - Array of scheduled Date objects/strings.
 * @param {Object} followUpsByDate - Map of actual follow-up data keyed by ISO date string (YYYY-MM-DD).
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
  // Ensure schedule dates are unique and correctly formatted for comparison
  const scheduledVisits = useMemo(() => {
    const uniqueDates = [...new Set(visitSchedule.map(d =>
      new Date(d).toISOString().split("T")[0] // Standardize to YYYY-MM-DD string
    ))];

    return uniqueDates.map(dateStr => {
      const followUp = followUpsByDate[dateStr];
      let status = 'Scheduled';

      if (followUp) {
        // Check the status field provided by the server
        status = followUp.status === 'missed' ? 'Missed' : 'Completed';
      } else {
        // If the date is in the past and no follow-up data exists, it's effectively Missed
        const date = new Date(dateStr);
        if (date < new Date() && date.toDateString() !== new Date().toDateString()) {
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
              <td className="p-2 font-medium">{visit.displayDate}</td>
              <td className="p-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(visit.status)}`}>
                  {visit.status}
                </span>
              </td>
              <td className="p-2">{visit.followUp?.weightKg || 'N/A'}</td>
              <td className="p-2 text-gray-600 max-w-xs truncate">{visit.followUp?.notes || 'N/A'}</td>
              <td className="p-2 space-x-2 text-center whitespace-nowrap">
                {visit.status === 'Completed' ? (
                  <button
                    onClick={() => onEditVisit(visit.dateIso)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                  >
                    Edit Data
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