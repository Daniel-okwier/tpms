import api from "@/utils/axios";

const REPORT_URL = "/reports";

const reportApi = {
  // GET /reports/full-dashboard 
  getDashboardData: (params = {}, config = {}) =>
    api.get(`${REPORT_URL}/full-dashboard`, { params, ...config }),

  // GET /reports/trends 
  getTrends: (params = {}, config = {}) =>
    api.get(`${REPORT_URL}/trends`, { params, ...config }),

  // GET /reports/public-health/download 
  downloadReport: (params = {}, config = {}) =>
    api.get(`${REPORT_URL}/public-health/download`, {
      params,
      responseType: 'arraybuffer', 
      ...config,
    }),
};

export default reportApi;