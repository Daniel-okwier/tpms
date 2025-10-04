import api from '../utils/axios';

const diagnosisApi = {
  getAll: () => api.get('/diagnoses'),
  getById: (id) => api.get(`/diagnoses/${id}`),
  create: (payload) => api.post('/diagnoses', payload),
  update: (id, updates) => api.put(`/diagnoses/${id}`, updates),
  remove: (id) => api.delete(`/diagnoses/${id}`),
};

export default diagnosisApi;