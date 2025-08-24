import * as adherenceService from '../services/adherenceService.js';

// Create or update a dose log
export const upsertDose = async (req, res) => {
  try {
    const log = await adherenceService.upsertDoseLog({ user: req.user, body: req.body });
    res.status(200).json(log);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const getAdherenceByPatient = async (req, res) => {
  try {
    const logs = await adherenceService.getLogsByPatient({ user: req.user, query: req.query });
    res.json(logs);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const verifyDose = async (req, res) => {
  try {
    const log = await adherenceService.verifyDoseLog({ user: req.user, id: req.params.id });
    res.json(log);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const voidDose = async (req, res) => {
  try {
    const result = await adherenceService.voidDoseLog({ user: req.user, id: req.params.id, reason: req.body.reason });
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const getMissedDoses = async (req, res) => {
  try {
    const items = await adherenceService.getMissedDosesLogs({ query: req.query });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adherenceSummary = async (req, res) => {
  try {
    const summary = await adherenceService.getAdherenceSummary({ user: req.user, query: req.query });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const triggerReminder = async (req, res) => {
  try {
    const result = await adherenceService.triggerAdherenceReminder({ patientId: req.params.patientId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
