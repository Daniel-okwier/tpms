import api from "@/utils/axios";

const fetchPrescriptions = async () => {
    const { data } = await api.get('/prescriptions');
    return data;
};

const createPrescription = async (prescriptionData) => {
    const { data } = await api.post('/prescriptions', prescriptionData);
    return data;
};

const updatePrescription = async (id, updateData) => {
    const { data } = await api.put(`/prescriptions/${id}`, updateData);
    return data;
};

const deletePrescription = async (id) => {
    await api.delete(`/prescriptions/${id}`);
    return id;
};

const prescriptionApi = {
    fetchPrescriptions,
    createPrescription,
    updatePrescription,
    deletePrescription,
};

export default prescriptionApi;