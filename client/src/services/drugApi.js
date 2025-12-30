import api from "@/utils/axios"; 

const fetchDrugs = async (filters = {}) => {
    const { data } = await api.get('/drugs', { params: filters });
    return data;
};

const createDrug = async (drugData) => {
    const { data } = await api.post('/drugs', drugData);
    return data;
};

const updateDrug = async (id, updateData) => {
    const { data } = await api.put(`/drugs/${id}`, updateData);
    return data;
};

const deleteDrug = async (id) => {
    await api.delete(`/drugs/${id}`);
    return id; 
};

const drugApi = {
    fetchDrugs,
    createDrug,
    updateDrug,
    deleteDrug,
};

export default drugApi;