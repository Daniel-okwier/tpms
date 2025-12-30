import Drug from '../models/drug.js';

class DrugService {
    static async createDrug(drugData) {
        const drug = new Drug(drugData);
        await drug.save();
        return drug;
    }

    static async getAllDrugs() {
        return await Drug.find();
    }

    static async getDrugById(drugId) {
        return await Drug.findById(drugId);
    }

    static async updateDrug(drugId, updates) {
        return await Drug.findByIdAndUpdate(drugId, updates, { new: true });
    }

    static async deleteDrug(drugId) {
        return await Drug.findByIdAndDelete(drugId);
    }
}

export default DrugService;