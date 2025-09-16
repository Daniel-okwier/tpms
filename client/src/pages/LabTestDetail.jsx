import React from 'react';

const LabTestDetail = ({ test, onClose }) => {
  if (!test) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full overflow-auto p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lab Test Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <strong>Patient:</strong> {test.patient?.name}
          </div>
          <div>
            <strong>Test Type:</strong> {test.testType}
          </div>
          <div>
            <strong>Status:</strong> {test.status}
          </div>
          <div>
            <strong>Priority:</strong> {test.priority}
          </div>
          <div>
            <strong>Specimen Type:</strong> {test.specimenType}
          </div>
          <div>
            <strong>Clinical Notes:</strong> {test.clinicalNotes || '-'}
          </div>
          <div>
            <strong>Ordered By:</strong> {test.orderedBy?.name} on{' '}
            {new Date(test.orderDate).toLocaleString()}
          </div>

          {/* --- Results sections --- */}
          {test.resultCommon && (
            <div className="border-t pt-2">
              <h3 className="font-semibold">Common Result</h3>
              <div>{test.resultCommon.resultText || '-'}</div>
              <div>{test.resultCommon.notes || '-'}</div>
            </div>
          )}

          {test.geneXpert && (
            <div className="border-t pt-2">
              <h3 className="font-semibold">GeneXpert</h3>
              <div>MTB Detected: {test.geneXpert.mtbDetected}</div>
              <div>RIF Resistance: {test.geneXpert.rifResistance}</div>
              <div>CT Value: {test.geneXpert.ctValue ?? '-'}</div>
            </div>
          )}

          {test.smear && (
            <div className="border-t pt-2">
              <h3 className="font-semibold">Smear Microscopy</h3>
              <div>Result: {test.smear.result}</div>
              <div>Grading: {test.smear.grading}</div>
            </div>
          )}

          {test.culture && (
            <div className="border-t pt-2">
              <h3 className="font-semibold">Culture</h3>
              <div>Growth: {test.culture.growth}</div>
              <div>Organism: {test.culture.organism || '-'}</div>
              <div>TTD Days: {test.culture.ttdDays ?? '-'}</div>
            </div>
          )}

          {test.xray && (
            <div className="border-t pt-2">
              <h3 className="font-semibold">Chest X-ray</h3>
              <div>Impression: {test.xray.impression || '-'}</div>
              <d
