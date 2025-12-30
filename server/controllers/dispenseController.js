import asyncHandler from '../middleware/asyncHandler.js';
import {
    createDispenseTransactionService,
    getDispensingRecordsService,
    updateDispenseRecordService, 
    deleteDispenseRecordService, 
} from '../services/dispenseService.js';

// @desc    Create a new dispensing record (Transaction)
// @route   POST /api/dispense
// @access  Private (Pharmacist, Admin)
export const createDispensingRecord = asyncHandler(async (req, res) => {
    const { drugId, patientId, quantityDispensed, dispensedBy, notes } = req.body;

    if (!drugId || !patientId || !quantityDispensed || !dispensedBy) {
        res.status(400);
        throw new Error('Please provide drug ID, patient ID, quantity, and dispenser ID.');
    }

    const newRecord = await createDispenseTransactionService({
        drug: drugId,
        patient: patientId,
        quantityDispensed,
        dispensedBy,
        notes,
    });

    res.status(201).json(newRecord);
});

// @desc    Get all dispensing records (History)
// @route   GET /api/dispense
// @access  Private (Admin, Pharmacist, Doctor)
export const getDispensingRecords = asyncHandler(async (req, res) => {
    const records = await getDispensingRecordsService(req.query);
    res.status(200).json(records);
});

// @desc    Update a dispensing record (e.g., correct notes)
// @route   PUT /api/dispense/:id
// @access  Private (Admin, highly restricted Pharmacist)
export const updateDispensingRecord = asyncHandler(async (req, res) => {
    const updatedRecord = await updateDispenseRecordService(req.params.id, req.body);
    res.status(200).json(updatedRecord);
});

// @desc    Delete/Void a dispensing record (Rollback inventory)
// @route   DELETE /api/dispense/:id
// @access  Private (Admin ONLY, due to financial/audit risk)
export const deleteDispensingRecord = asyncHandler(async (req, res) => {
    const result = await deleteDispenseRecordService(req.params.id);
    res.status(200).json(result);
});