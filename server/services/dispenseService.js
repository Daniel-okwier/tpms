import Drug from '../models/drug.js';
import DispensingRecord from '../models/dispensingRecord.js';

// The main transaction logic
export const createDispenseTransactionService = async (recordData) => {
    const { drug: drugId, quantityDispensed } = recordData;

    // 1. Check drug availability and expiration
    const drug = await Drug.findById(drugId);
    if (!drug) {
        throw new Error('Drug not found in inventory.');
    }

    if (drug.stockQuantity < quantityDispensed) {
        throw new Error(`Insufficient stock. Only ${drug.stockQuantity} available.`);
    }

    // Check expiry date validation (Client side validation is good, but server side is essential)
    if (new Date(drug.expiryDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
        throw new Error('Cannot dispense: Drug is expired.');
    }

    // 2. Reduce stock quantity (CRITICAL)
    drug.stockQuantity -= quantityDispensed;
    await drug.save();

    // 3. Create dispensing record (CRITICAL)
    const record = new DispensingRecord(recordData);
    await record.save();

    return record; // Returns the full dispensing record
};

// Fetch all dispensing records (or filter)
export const getDispensingRecordsService = async (filters = {}) => {
    return await DispensingRecord.find(filters)
        .populate('patient', 'fullName patientId tbDiagnosisType')
        .populate('drug', 'name dosage unitType')
        .populate('dispensedBy', 'fullName')
        .sort({ dispensingDate: -1 });
};


// --- Update Service ---
export const updateDispenseRecordService = async (id, updateData) => {
    // We strictly limit what can be updated to prevent stock errors.
    // Generally, only non-critical fields like 'notes' should be allowed here.
    const allowedUpdates = { notes: updateData.notes }; 

    const record = await DispensingRecord.findByIdAndUpdate(id, allowedUpdates, { 
        new: true, 
        runValidators: true 
    });

    if (!record) {
        throw new Error('Dispensing record not found.');
    }
    return record;
};

// --- Delete/Reversal Service (CRITICAL LOGIC) ---
export const deleteDispenseRecordService = async (id) => {
    const record = await DispensingRecord.findById(id);

    if (!record) {
        throw new Error('Dispensing record not found.');
    }

    // 1. Get the drug and the quantity dispensed
    const { drug: drugId, quantityDispensed } = record;
    const drug = await Drug.findById(drugId);

    if (!drug) {
        // If the drug is deleted from inventory, we cannot rollback stock, 
        // but we can still delete the record. You might want to log this error.
        console.error(`Attempting to delete record for non-existent drug ID: ${drugId}`);
    } else {
        // 2. Rollback the stock quantity (Add dispensed amount back)
        drug.stockQuantity += quantityDispensed;
        await drug.save();
    }
    
    // 3. Delete the dispensing record
    await DispensingRecord.deleteOne({ _id: id });

    return { message: 'Dispensing record successfully voided and inventory rolled back.' };
};