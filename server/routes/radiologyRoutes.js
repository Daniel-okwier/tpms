// routes/radiologyRoutes.js (Converted to ES Modules)
import express from 'express';
const router = express.Router();

// ✅ Use import instead of require
import { 
    getStudies, 
    createStudy, 
    updateReport,
    getStudy 
} from '../controllers/radiologyController.js'; 

// --- Endpoints mapped to Controller functions ---

router.get('/', getStudies);
router.post('/', createStudy);
router.get('/:id', getStudy);

// This specific route handles the radiologist updating the report
router.put('/:id/report', updateReport); 

// ✅ Use export default instead of module.exports
export default router;