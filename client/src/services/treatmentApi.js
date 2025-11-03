
import axios from "axios";

const API_URL = "/api/treatments";

const treatmentApi = {
  // GET /api/treatments
  getAll: (params = {}, config = {}) => axios.get(API_URL, { params, ...config }),

  // GET /api/treatments/:id
  getById: (id, config = {}) => axios.get(`${API_URL}/${id}`, config),

  // POST /api/treatments
  create: (payload, config = {}) => axios.post(API_URL, payload, config),

  // PUT /api/treatments/:id
  update: (id, updates, config = {}) => axios.put(`${API_URL}/${id}`, updates, config),

  // POST /api/treatments/:id/follow-up
  addFollowUp: (id, followUp, config = {}) =>
    axios.post(`${API_URL}/${id}/follow-up`, followUp, config),

  // POST /api/treatments/:id/complete
  complete: (id, body = {}, config = {}) =>
    axios.post(`${API_URL}/${id}/complete`, body, config),

  // DELETE /api/treatments/:id  (archive)
  archive: (id, config = {}) => axios.delete(`${API_URL}/${id}`, config),
};

export default treatmentApi;
