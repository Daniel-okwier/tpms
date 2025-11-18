import api from "@/utils/axios";

const treatmentApi = {
  // GET /treatments
  getAll: (params = {}, config = {}) => api.get("/treatments", { params, ...config }),

  // GET /treatments/:id
  getById: (id, config = {}) => api.get(`/treatments/${id}`, config),

  // POST /treatments
  create: (payload, config = {}) => api.post("/treatments", payload, config),

  // PUT /treatments/:id
  update: (id, updates, config = {}) => api.put(`/treatments/${id}`, updates, config),

  // POST /treatments/:id/follow-up
  addFollowUp: (id, followUp, config = {}) =>
    api.post(`/treatments/${id}/follow-up`, followUp, config),

  // POST /treatments/:id/complete
  complete: (id, body = {}, config = {}) =>
    api.post(`/treatments/${id}/complete`, body, config),

  // DELETE /treatments/:id (archive)
  archive: (id, config = {}) => api.delete(`/treatments/${id}`, config),
};

export default treatmentApi;
