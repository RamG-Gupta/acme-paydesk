import axios from 'axios';

// Connect cleanly to the Rails API space
const API_BASE = 'http://localhost:3000/api/v1';

export const apiService = {
  // Fetch paginated directory with dynamic search and country/dept filtering matrices
  getEmployees: async ({ page = 1, perPage = 20, search = '', country = '', department = '', status = '' }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      search,
      country,
      department,
      status
    });
    const response = await axios.get(`${API_BASE}/employees?${params.toString()}`);
    return response.data;
  },

  // Fetch individual employee target details along with full audit logs
  getEmployeeDetails: async (id) => {
    const response = await axios.get(`${API_BASE}/employees/${id}`);
    return response.data;
  },

  // Update specific salary items and commit an operational reason string
  updateSalary: async (id, { baseSalary, allowances, changeReason }) => {
    const response = await axios.put(`${API_BASE}/employees/${id}`, {
      base_salary: parseFloat(baseSalary),
      allowances: parseFloat(allowances),
      change_reason: changeReason
    });
    return response.data;
  },

  // Extract executive insights across the entire corporate workforce roster
  getAnalytics: async () => {
    const response = await axios.get(`${API_BASE}/employees/analytics`);
    return response.data;
  }
};
